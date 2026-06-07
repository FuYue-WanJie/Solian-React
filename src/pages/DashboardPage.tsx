import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Spin, Tag, Button } from 'antd'
import { App } from 'antd'
import {
  RiseOutlined,
  CloudOutlined,
  SunOutlined,
  ThunderboltOutlined,
  MoonOutlined,
  FireOutlined,
  BankOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  SkinOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  SafetyCertificateOutlined,
  FireFilled,
  LeftOutlined,
  RightOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { ReactNode } from 'react'
import {
  getCheckInToday,
  doCheckIn,
  CHECKIN_LEVELS,
} from '../services/checkInService'
import type { CheckInResult } from '../services/checkInService'
import { getFeaturedPosts } from '../services/postService'
import type { FeaturedPost } from '../services/postService'

const { Text } = Typography

// ============ 时段图标 ============
function getTimeInfo(hour: number): { icon: ReactNode; label: string } {
  if (hour >= 5 && hour < 7) return { icon: <RiseOutlined style={{ fontSize: 32, color: '#fa8c16' }} />, label: '日出' }
  if (hour >= 7 && hour < 9) return { icon: <CloudOutlined style={{ fontSize: 32, color: '#faad14' }} />, label: '清晨' }
  if (hour >= 9 && hour < 12) return { icon: <SunOutlined style={{ fontSize: 32, color: '#fadb14' }} />, label: '上午' }
  if (hour >= 12 && hour < 14) return { icon: <ThunderboltOutlined style={{ fontSize: 32, color: '#fa541c' }} />, label: '正午' }
  if (hour >= 14 && hour < 17) return { icon: <CloudOutlined style={{ fontSize: 32, color: '#69b1ff' }} />, label: '下午' }
  if (hour >= 17 && hour < 19) return { icon: <FireOutlined style={{ fontSize: 32, color: '#ff7a45' }} />, label: '日落' }
  if (hour >= 19 && hour < 21) return { icon: <MoonOutlined style={{ fontSize: 32, color: '#b37feb' }} />, label: '傍晚' }
  if (hour >= 21 || hour < 1) return { icon: <MoonOutlined style={{ fontSize: 32, color: '#597ef7' }} />, label: '夜晚' }
  return { icon: <CloudOutlined style={{ fontSize: 32, color: '#8c8c8c' }} />, label: '深夜' }
}

function formatTime(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

// ============ 时钟组件 ============
function ClockCard() {
  const [now, setNow] = useState(new Date())
  const { icon, label } = getTimeInfo(now.getHours())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Card style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {icon}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: 1, fontFamily: 'monospace' }}>
            {formatTime(now)}
          </div>
          <Text type="secondary" style={{ fontSize: 13 }}>{label}</Text>
        </div>
      </div>
    </Card>
  )
}

// ============ 签到组件 ============
function CheckInCard({ onCheckedIn }: { onCheckedIn: (result: CheckInResult) => void }) {
  const navigate = useNavigate()
  const { message: msgApi } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)

  const fetchCheckIn = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCheckInToday()
      setResult(data)
      if (data) onCheckedIn(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [onCheckedIn])

  useEffect(() => {
    fetchCheckIn()
  }, [fetchCheckIn])

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const data = await doCheckIn()
      setResult(data)
      msgApi.success(`签到成功！+${data.rewardPoints} 积分`)
      onCheckedIn(data)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '签到失败'
      msgApi.error(errorMsg)
    } finally {
      setCheckingIn(false)
    }
  }

  const levelInfo = result
    ? CHECKIN_LEVELS[typeof result.level === 'number' ? result.level : 0] || CHECKIN_LEVELS[0]
    : null

  if (loading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}><Spin /></div>
      </Card>
    )
  }

  return (
    <Card style={cardStyle} styles={{ body: { padding: '14px 18px' } }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          {result ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SafetyCertificateOutlined style={{ fontSize: 18, color: levelInfo?.color || '#999', flexShrink: 0 }} />
                <Text style={{ fontSize: 18, fontWeight: 600, color: levelInfo?.color || '#999' }}>
                  {levelInfo?.label || '未知'}
                </Text>
              </div>
              <Text
                type="secondary"
                style={{ display: 'block', margin: '4px 0 0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {result.fortuneReport?.summary || '今日已签到'}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 15 }}>今日还未签到</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 13 }}>点击右侧签到</Text>
            </>
          )}
        </div>

        <div
          onClick={result ? () => navigate('/checkin/detail') : handleCheckIn}
          style={{
            fontSize: 28,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            userSelect: 'none',
            color: result ? '#8c6e4e' : '#ff4d4f',
            marginLeft: 12,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
          title={result ? '查看签到详情' : '点击签到'}
        >
          {checkingIn ? <Spin /> : result ? <BankOutlined /> : <FireFilled />}
        </div>
      </div>
    </Card>
  )
}

// ============ 今日签文卡片 ============
function FortuneCard({ result }: { result: CheckInResult }) {
  const report = result.fortuneReport
  if (!report) return null

  const levelInfo = CHECKIN_LEVELS[typeof result.level === 'number' ? result.level : 0] || CHECKIN_LEVELS[0]
  const goodTip = result.tips?.find((t) => t.isPositive)
  const badTip = result.tips?.find((t) => !t.isPositive)

  return (
    <Card
      style={{
        borderRadius: 14,
        border: 'none',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: '18px 20px' } }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <SafetyCertificateOutlined style={{ fontSize: 20, color: '#9B8FD4', flexShrink: 0 }} />
        <Text strong style={{ fontSize: 17, color: '#1a1a1a', flexShrink: 0 }}>今日签文</Text>
      </div>

      {/* 三个 pill 标签 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Tag style={pillStyle}>
          <BulbOutlined style={{ marginRight: 4 }} />
          {levelInfo.label}
        </Tag>
        <Tag style={pillStyle}>
          <SkinOutlined style={{ marginRight: 4 }} />
          {report.luckyColor}
        </Tag>
        <Tag style={pillStyle}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {report.luckyTime}
        </Tag>
      </div>

      {/* 签诗 */}
      <div style={{
        padding: '12px 14px',
        background: '#faf8ff',
        borderRadius: 10,
        marginBottom: 14,
        overflow: 'hidden',
      }}>
        <Text style={{ fontSize: 15, fontStyle: 'italic', color: '#555', lineHeight: 1.6, wordBreak: 'break-word' }}>
          {report.poem}
        </Text>
      </div>

      {/* 宜忌 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: '#389e0d', display: 'block', wordBreak: 'break-word' }}>
              宜
            </Text>
            <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>
              {report.luckyAction}
            </Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
          <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <Text style={{ fontSize: 14, fontWeight: 500, color: '#cf1322', display: 'block', wordBreak: 'break-word' }}>
              忌
            </Text>
            <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>
              {report.avoidAction}
            </Text>
          </div>
        </div>
      </div>

      {/* 提示列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {goodTip && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
            <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <Text style={{ fontSize: 14, fontWeight: 500, color: '#389e0d', display: 'block', wordBreak: 'break-word' }}>
                {goodTip.title}
              </Text>
              <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>
                {goodTip.content}
              </Text>
            </div>
          </div>
        )}
        {badTip && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', overflow: 'hidden' }}>
            <WarningOutlined style={{ color: '#ff4d4f', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <Text style={{ fontSize: 14, fontWeight: 500, color: '#cf1322', display: 'block', wordBreak: 'break-word' }}>
                {badTip.title}
              </Text>
              <Text style={{ fontSize: 13, color: '#666', display: 'block', marginTop: 2, wordBreak: 'break-word' }}>
                {badTip.content}
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ============ 精选帖子卡片 ============
function FeaturedPostsCard() {
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<FeaturedPost[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeaturedPosts()
      setPosts(data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + posts.length) % posts.length)
  }, [posts.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % posts.length)
  }, [posts.length])

  if (loading) {
    return (
      <Card style={cardStyle}>
        <div style={{ textAlign: 'center', padding: '12px 0' }}><Spin /></div>
      </Card>
    )
  }

  if (posts.length === 0) {
    return null
  }

  const currentPost = posts[currentIndex]

  return (
    <Card
      style={cardStyle}
      styles={{ body: { padding: '14px 18px' } }}
    >
      {/* 标题行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <StarOutlined style={{ fontSize: 20, color: '#faad14', flexShrink: 0 }} />
        <Text strong style={{ fontSize: 17, color: '#1a1a1a', flexShrink: 0 }}>精选帖子</Text>
        <Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
          {currentIndex + 1} / {posts.length}
        </Text>
      </div>

      {/* 帖子内容区域 */}
      <div style={{
        maxHeight: '400px',
        overflowY: 'auto',
        marginBottom: 12,
      }}>
        {/* 发布者信息（头像+昵称） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
          {currentPost.publisher.picture?.id ? (
            <img
              src={`https://api.solian.app/drive/files/${currentPost.publisher.picture.id}`}
              alt={currentPost.publisher.nick}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: '#e6e6e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              color: '#999',
              flexShrink: 0,
            }}>
              <UserOutlined />
            </div>
          )}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <Text strong style={{ fontSize: 14, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentPost.publisher.nick}
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              @{currentPost.publisher.name}
            </Text>
          </div>
        </div>

        {/* 帖子标题 */}
        {currentPost.title && (
          <Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
            {currentPost.title}
          </Text>
        )}

        {/* 帖子内容 */}
        <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#333', wordBreak: 'break-word' }}>
          {currentPost.content}
        </Text>

        {/* 附件（图片） */}
        {currentPost.attachments && currentPost.attachments.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {currentPost.attachments.map((attachment) => {
              if (attachment.mimeType?.startsWith('image/')) {
                const imageUrl = attachment.fileMeta ? `https://api.solian.app/drive/files/${attachment.id}` : null
                return imageUrl ? (
                  <img
                    key={attachment.id}
                    src={imageUrl}
                    alt={attachment.name}
                    style={{
                      maxWidth: '100%',
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                ) : null
              }
              return null
            })}
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <Button icon={<LeftOutlined />} onClick={handlePrev} disabled={posts.length <= 1} style={{ flex: 1 }}>
          上一条
        </Button>
        <Button icon={<RightOutlined />} onClick={handleNext} disabled={posts.length <= 1} style={{ flex: 1 }}>
          下一条
        </Button>
      </div>
    </Card>
  )
}

// ============ 公共样式 ============
const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  border: 'none',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  overflow: 'hidden',
}

const pillStyle: React.CSSProperties = {
  margin: 0,
  borderRadius: 20,
  padding: '4px 14px',
  fontSize: 13,
  border: 'none',
  background: '#f3f0ff',
  color: '#7c6fca',
}

// ============ 仪表盘页面 ============
export default function DashboardPage() {
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null)

  const handleCheckedIn = useCallback((result: CheckInResult) => {
    setCheckInResult(result)
  }, [])

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ClockCard />
        <CheckInCard onCheckedIn={handleCheckedIn} />
        {checkInResult?.fortuneReport && (
          <FortuneCard result={checkInResult} />
        )}
        <FeaturedPostsCard />
      </div>
    </div>
  )
}
