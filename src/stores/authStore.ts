import { create } from 'zustand'
import type { TokenResponse } from '../services/authService'

interface TokenPair {
  token: string
  refreshToken: string
  expiresAt: number
  refreshExpiresAt: number
}

interface AuthState {
  tokenPair: TokenPair | null
  isAuthenticated: boolean
  isGuest: boolean

  /** 从 localStorage / Cookie 恢复 Token */
  restore: () => void

  /** 保存 Token 到 localStorage + Cookie 和 state */
  setToken: (resp: TokenResponse) => void

  /** 游客登录 */
  loginAsGuest: () => void

  /** 清除 Token（登出） */
  clearToken: () => void

  /** 获取当前有效的 Access Token */
  getAccessToken: () => string | null

  /** 检查 Access Token 是否过期 */
  isAccessTokenExpired: () => boolean
}

const TOKEN_KEY = 'token_pair'
const COOKIE_KEY = 'solian_token'

// ============ Cookie 工具 ============

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 86400000).toUTCString()
  // Domain=.trae.cn 让所有子域共享 Cookie
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax;Domain=.trae.cn`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Domain=.trae.cn`
}

// ============ localStorage 工具 ============

function loadTokenPair(): TokenPair | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function saveTokenPair(pair: TokenPair | null) {
  if (pair) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(pair))
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

// ============ 统一存储：localStorage + Cookie ============

function saveToken(pair: TokenPair | null) {
  saveTokenPair(pair)
  if (pair) {
    setCookie(COOKIE_KEY, JSON.stringify(pair), 30)
  } else {
    deleteCookie(COOKIE_KEY)
  }
}

function loadToken(): TokenPair | null {
  // 优先从 localStorage 读取（同域名下更快）
  const fromLs = loadTokenPair()
  if (fromLs) return fromLs
  // 域名变化时从 Cookie 读取（跨子域共享）
  const fromCookie = getCookie(COOKIE_KEY)
  if (fromCookie) {
    try {
      const pair = JSON.parse(fromCookie) as TokenPair
      // 同步回 localStorage
      saveTokenPair(pair)
      return pair
    } catch {
      return null
    }
  }
  return null
}

// ============ Zustand Store ============

const GUEST_KEY = 'guest_mode'

function isGuestMode() {
  try {
    return localStorage.getItem(GUEST_KEY) === 'true'
  } catch {
    return false
  }
}

function setGuestMode(value: boolean) {
  try {
    if (value) {
      localStorage.setItem(GUEST_KEY, 'true')
    } else {
      localStorage.removeItem(GUEST_KEY)
    }
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  tokenPair: null,
  isAuthenticated: false,
  isGuest: false,

  restore() {
    const pair = loadToken()
    const guest = isGuestMode()
    if (pair && pair.expiresAt > Date.now()) {
      set({ tokenPair: pair, isAuthenticated: true, isGuest: false })
    } else if (guest) {
      set({ tokenPair: null, isAuthenticated: false, isGuest: true })
    } else {
      saveToken(null)
      setGuestMode(false)
      set({ tokenPair: null, isAuthenticated: false, isGuest: false })
    }
  },

  setToken(resp: TokenResponse) {
    const now = Date.now()
    const pair: TokenPair = {
      token: resp.token,
      refreshToken: resp.refreshToken,
      expiresAt: now + resp.expiresIn * 1000,
      refreshExpiresAt: now + resp.refreshExpiresIn * 1000,
    }
    saveToken(pair)
    setGuestMode(false)
    set({ tokenPair: pair, isAuthenticated: true, isGuest: false })
  },

  loginAsGuest() {
    setGuestMode(true)
    saveToken(null)
    set({ tokenPair: null, isAuthenticated: false, isGuest: true })
  },

  clearToken() {
    saveToken(null)
    setGuestMode(false)
    set({ tokenPair: null, isAuthenticated: false, isGuest: false })
  },

  getAccessToken() {
    const { tokenPair } = get()
    if (!tokenPair) return null
    if (tokenPair.expiresAt < Date.now()) return null
    return tokenPair.token
  },

  isAccessTokenExpired() {
    const { tokenPair } = get()
    if (!tokenPair) return true
    return tokenPair.expiresAt < Date.now()
  },
}))

// ============ 全局工具：不依赖 store 直接读取 Token ============

export function getStoredToken(): string | null {
  const pair = loadToken()
  return pair && pair.expiresAt > Date.now() ? pair.token : null
}

// ============ JWT 解析工具 ============

/** 正确处理 UTF-8 的 Base64 解码 */
function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4 !== 0) base64 += '='
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder('utf-8').decode(bytes)
}

/** 解析 JWT 获取用户信息的工具函数 */
export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1]))
    return payload
  } catch {
    return null
  }
}
