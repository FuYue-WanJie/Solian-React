import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Input,
  Card,
  Steps,
  Space,
  Alert,
  Spin,
  Typography,
  Divider,
} from 'antd'
import {
  UserOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  GoogleOutlined,
  GithubOutlined,
  AppleOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import {
  createChallenge,
  getChallengeFactors,
  requestFactorCode,
  verifyChallenge,
  exchangeToken,
  getOAuthUrl,
  FACTOR_TYPES,
} from '../services/authService'
import type { AuthChallenge, AuthFactor } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const { Title, Text } = Typography

type LoginStep = 'input' | 'factor' | 'verify' | 'success'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setToken, isAuthenticated, isGuest, loginAsGuest } = useAuthStore()

  // 如果已登录或是游客，跳转首页
  useEffect(() => {
    if (isAuthenticated || isGuest) navigate('/', { replace: true })
  }, [isAuthenticated, isGuest, navigate])

  // 游客登录
  const handleGuestLogin = () => {
    loginAsGuest()
    navigate('/', { replace: true })
  }

  // 步骤状态
  const [step, setStep] = useState<LoginStep>('input')
  const [loading, setLoading] = useState(false)

  // 用户输入
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')

  // 挑战数据
  const [challenge, setChallenge] = useState<AuthChallenge | null>(null)
  const [factors, setFactors] = useState<AuthFactor[]>([])
  const [selectedFactor, setSelectedFactor] = useState<AuthFactor | null>(null)

  // 错误信息
  const [error, setError] = useState('')

  // 验证码倒计时
  const [codeCooldown, setCodeCooldown] = useState(0)

  // 验证码倒计时 effect
  useEffect(() => {
    if (codeCooldown <= 0) return
    const timer = setTimeout(() => setCodeCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [codeCooldown])

  // ============ 第 1 步：创建挑战 ============
  const handleCreateChallenge = async () => {
    if (!account.trim()) {
      setError('请输入用户名或邮箱')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await createChallenge(account.trim())
      setChallenge(result)

      // 获取可用因子
      const factorList = await getChallengeFactors(result.id)
      setFactors(factorList)

      // 如果只有一步且只有一个因子，自动选择密码因子
      if (result.stepRemain === 1 && factorList.length === 1) {
        setSelectedFactor(factorList[0])
        setStep('verify')
      } else {
        setStep('factor')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '创建挑战失败，请检查用户名'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ============ 第 2 步：选择因子并请求验证码 ============
  const handleSelectFactor = async (factor: AuthFactor) => {
    setSelectedFactor(factor)
    setLoading(true)
    setError('')

    // 对于非密码因子（邮箱、TOTP等），需要先请求验证码
    if (factor.type !== 0 && factor.type !== 4 && factor.type !== 5) {
      try {
        await requestFactorCode(challenge!.id, factor.id)
        setCodeCooldown(60)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : '请求验证码失败'
        setError(msg)
        setLoading(false)
        return
      }
    }

    setStep('verify')
    setLoading(false)
  }

  // ============ 第 3 步：验证因子 ============
  const handleVerify = async () => {
    if (!password.trim()) {
      setError('请输入密码或验证码')
      return
    }
    if (!challenge || !selectedFactor) return

    setLoading(true)
    setError('')
    try {
      const updated = await verifyChallenge(challenge.id, selectedFactor.id, password)

      if (updated.stepRemain > 0) {
        // 还需要更多因子验证
        const factorList = await getChallengeFactors(challenge.id)
        setFactors(factorList)
        setSelectedFactor(null)
        setPassword('')
        setStep('factor')
      } else {
        // 挑战完成，换取 Token
        setStep('success')
        const tokenResp = await exchangeToken(challenge.id)
        setToken(tokenResp)
        navigate('/', { replace: true })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '验证失败，请检查密码或验证码'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ============ OAuth 登录 ============
  const handleOAuth = (provider: string) => {
    window.location.href = getOAuthUrl(provider)
  }

  // ============ 回到上一步 ============
  const handleBack = () => {
    setError('')
    setPassword('')
    if (step === 'verify') {
      setStep('factor')
      setSelectedFactor(null)
    } else if (step === 'factor') {
      setStep('input')
      setChallenge(null)
      setFactors([])
    }
  }

  // 当前步骤索引（用于 Steps 组件）
  const currentStepIndex =
    step === 'input' ? 0 : step === 'factor' ? 1 : step === 'verify' ? 2 : 3

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 460,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
        styles={{ body: { padding: '32px 32px 24px' } }}
      >
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1677ff' }}>
            <SafetyCertificateOutlined /> Solian
          </Title>
          <Text type="secondary">登录到你的账户</Text>
        </div>

        {/* 步骤指示器 */}
        <Steps
          current={currentStepIndex}
          size="small"
          items={[
            { title: '输入账号' },
            { title: '选择方式' },
            { title: '验证' },
            { title: '完成' },
          ]}
          style={{ marginBottom: 28 }}
        />

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* ====== 步骤 0：输入账号 ====== */}
        {step === 'input' && (
          <div>
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="用户名或邮箱"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onPressEnter={handleCreateChallenge}
              disabled={loading}
              autoFocus
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleCreateChallenge}
              style={{ marginTop: 16 }}
            >
              下一步
            </Button>

            <Button
              type="link"
              size="large"
              block
              onClick={handleGuestLogin}
              style={{ marginTop: 8, color: '#999' }}
            >
              暂不登录，以游客身份浏览
            </Button>

            <Divider plain>
              <Text type="secondary" style={{ fontSize: 13 }}>
                或使用第三方登录
              </Text>
            </Divider>

            <Space size="middle" style={{ display: 'flex', justifyContent: 'center' }}>
              <Button
                size="large"
                icon={<GithubOutlined />}
                onClick={() => handleOAuth('github')}
                style={{ borderRadius: 8 }}
              >
                GitHub
              </Button>
              <Button
                size="large"
                icon={<GoogleOutlined />}
                onClick={() => handleOAuth('google')}
                style={{ borderRadius: 8 }}
              >
                Google
              </Button>
              <Button
                size="large"
                icon={<AppleOutlined />}
                onClick={() => handleOAuth('apple')}
                style={{ borderRadius: 8 }}
              >
                Apple
              </Button>
            </Space>
          </div>
        )}

        {/* ====== 步骤 1：选择认证因子 ====== */}
        {step === 'factor' && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              请选择认证方式（还需 {challenge?.stepRemain} 步验证）
            </Text>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              {factors.map((factor) => {
                const info = FACTOR_TYPES[factor.type] || {
                  label: `未知 (${factor.type})`,
                  icon: '❓',
                }
                return (
                  <Button
                    key={factor.id}
                    size="large"
                    block
                    icon={<KeyOutlined />}
                    onClick={() => handleSelectFactor(factor)}
                    loading={loading && selectedFactor?.id === factor.id}
                    style={{
                      textAlign: 'left',
                      height: 52,
                      borderRadius: 8,
                      justifyContent: 'flex-start',
                    }}
                  >
                    <span style={{ marginRight: 8, fontSize: 18 }}>{info.icon}</span>
                    {info.label}
                  </Button>
                )
              })}
            </Space>
            <Button block style={{ marginTop: 16 }} onClick={handleBack}>
              返回上一步
            </Button>
          </div>
        )}

        {/* ====== 步骤 2：输入密码/验证码 ====== */}
        {step === 'verify' && (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              {selectedFactor
                ? `使用 ${
                    FACTOR_TYPES[selectedFactor.type]?.label || '认证因子'
                  } 验证`
                : '验证'}
            </Text>
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder={
                selectedFactor?.type === 0
                  ? '输入密码'
                  : selectedFactor?.type === 4
                    ? '输入 PIN 码'
                    : '输入验证码'
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onPressEnter={handleVerify}
              disabled={loading}
              autoFocus
            />
            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleVerify}
              style={{ marginTop: 16 }}
            >
              验证
            </Button>
            <Button block style={{ marginTop: 8 }} onClick={handleBack}>
              返回上一步
            </Button>
          </div>
        )}

        {/* ====== 步骤 3：成功 ====== */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>正在获取 Token...</p>
          </div>
        )}
      </Card>
    </div>
  )
}
