import api from './api'

// ============ 类型定义 ============

export interface AuthChallenge {
  id: string
  expiredAt: string
  stepRemain: number
  stepTotal: number
  failedAttempts: number
  blacklistFactors: string[]
  audiences: string[]
  scopes: string[]
  ipAddress: string
  userAgent: string
  deviceId: string
  deviceName: string
  platform: number
  accountId: string
  createdAt: string
  updatedAt: string
}

export interface AuthFactor {
  id: string
  type: number
  label: string
  createdAt: string
  updatedAt: string
}

export interface TokenResponse {
  token: string
  refreshToken: string
  expiresIn: number
  refreshExpiresIn: number
}

// 认证因子类型映射
export const FACTOR_TYPES: Record<number, { label: string; icon: string }> = {
  0: { label: '密码', icon: '🔒' },
  1: { label: '邮箱验证码', icon: '📧' },
  2: { label: '应用内推送', icon: '📱' },
  3: { label: 'TOTP 验证码', icon: '🔢' },
  4: { label: 'PIN 码', icon: '🔑' },
  5: { label: '恢复代码', icon: '🆘' },
  6: { label: '物理通行证', icon: '💳' },
  7: { label: 'Passkey', icon: '🪪' },
}

// 平台枚举
export const PLATFORM = 1 // Web

// 认证 API 基础路径
const AUTH_BASE = '/padlock/auth'

// ============ 认证 API ============

/** 生成设备 ID */
export function generateDeviceId(): string {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = `web-${crypto.randomUUID()}`
    localStorage.setItem('device_id', id)
  }
  return id
}

/** 第 1 步：创建认证挑战 */
export async function createChallenge(account: string): Promise<AuthChallenge> {
  const resp = await api.post(`${AUTH_BASE}/challenge`, {
    account,
    device_id: generateDeviceId(),
    device_name: 'Solian-React Web',
    platform: PLATFORM,
  })
  return resp.data
}

/** 第 2 步：获取可用的认证因子 */
export async function getChallengeFactors(challengeId: string): Promise<AuthFactor[]> {
  const resp = await api.get(`${AUTH_BASE}/challenge/${challengeId}/factors`)
  return resp.data
}

/** 第 3a 步：请求因子验证码（邮箱/OTP 等） */
export async function requestFactorCode(challengeId: string, factorId: string): Promise<void> {
  await api.post(`${AUTH_BASE}/challenge/${challengeId}/factors/${factorId}`)
}

/** 第 3b 步：提交因子验证 */
export async function verifyChallenge(
  challengeId: string,
  factorId: string,
  password: string,
): Promise<AuthChallenge> {
  const resp = await api.patch(`${AUTH_BASE}/challenge/${challengeId}`, {
    factor_id: factorId,
    password,
  })
  return resp.data
}

/** 第 4 步：用挑战换 Token */
export async function exchangeToken(challengeId: string): Promise<TokenResponse> {
  const resp = await api.post(`${AUTH_BASE}/token`, {
    grant_type: 'authorization_code',
    code: challengeId,
  })
  return resp.data
}

/** 刷新 Token */
export async function refreshToken(refreshTokenStr?: string): Promise<TokenResponse> {
  const payload: Record<string, string> = { grant_type: 'refresh_token' }
  if (refreshTokenStr) {
    payload.refresh_token = refreshTokenStr
  }
  const resp = await api.post(`${AUTH_BASE}/token`, payload)
  return resp.data
}

/** 登出 */
export async function logout(): Promise<void> {
  await api.post(`${AUTH_BASE}/logout`)
}

/** 获取当前身份 */
export async function getMe(): Promise<Record<string, unknown>> {
  const resp = await api.get(`${AUTH_BASE}/me`)
  return resp.data
}

/** 第三方 OAuth 登录 URL */
export function getOAuthUrl(provider: string): string {
  const params = new URLSearchParams({
    returnUrl: window.location.origin + '/auth/callback',
    deviceId: generateDeviceId(),
    flow: 'login',
  })
  return `https://api.solian.app${AUTH_BASE}/login/${provider}?${params.toString()}`
}
