import api from './api'

// ============ 类型定义 ============

export interface CheckInTip {
  isPositive: boolean
  title: string
  content: string
}

export interface FortuneReport {
  version: number
  poem: string
  summary: string
  summaryDetail: string | null
  wish: string
  love: string
  study: string
  career: string
  health: string
  lostItem: string
  luckyColor: string
  luckyDirection: string
  luckyTime: string
  luckyItem: string
  luckyAction: string
  avoidAction: string
  ritual: string
}

export interface CheckInResult {
  id: string
  level: number | string
  rewardPoints: number
  rewardExperience: number
  tips: CheckInTip[]
  fortuneReport: FortuneReport | null
  accountId: string
  createdAt: string
  updatedAt: string
}

// 签到等级映射
export const CHECKIN_LEVELS: Record<number, { label: string; color: string }> = {
  0: { label: '未知', color: '#999' },
  1: { label: '大凶', color: '#ff4d4f' },
  2: { label: '凶', color: '#ff7875' },
  3: { label: '末吉', color: '#ffa39e' },
  4: { label: '小吉', color: '#ffd666' },
  5: { label: '中吉', color: '#95de64' },
  6: { label: '吉', color: '#52c41a' },
  7: { label: '大吉', color: '#237804' },
}

// ============ API ============

const CHECKIN_BASE = '/passport/accounts/me/check-in'

/** 查询今日签到结果 */
export async function getCheckInToday(): Promise<CheckInResult | null> {
  try {
    const resp = await api.get<CheckInResult>(CHECKIN_BASE, {
      params: { version: 2 },
    })
    return resp.data
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const response = (err as { response: { status: number } }).response
      if (response.status === 404) return null
    }
    throw err
  }
}

/** 执行签到 */
export async function doCheckIn(): Promise<CheckInResult> {
  const resp = await api.post<CheckInResult>(CHECKIN_BASE, null, {
    params: { version: 2 },
  })
  return resp.data
}
