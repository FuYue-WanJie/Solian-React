import axios from 'axios'

// ============ snake_case → camelCase 转换 ============

function toCamelCase(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(toCamelCase)
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = toCamelCase(value)
  }
  return result
}

// ============ 统一 API 客户端 ============

const API_BASE = 'https://api.solian.app'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动附加 Token
api.interceptors.request.use((config) => {
  const tokenPair = localStorage.getItem('token_pair')
  if (tokenPair) {
    try {
      const { token } = JSON.parse(tokenPair)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore
    }
  }
  return config
})

// 响应拦截器：自动将 snake_case 转为 camelCase
api.interceptors.response.use((response) => {
  if (response.data && typeof response.data === 'object') {
    response.data = toCamelCase(response.data)
  }
  return response
})

export default api
