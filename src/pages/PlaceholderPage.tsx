import { Card, Result } from 'antd'
import { useLocation } from 'react-router-dom'

const PAGE_NAMES: Record<string, string> = {
  '/explore': '探索',
  '/chat': '聊天',
  '/realm': '领域',
  '/account': '账号',
  '/drive': '云盘',
  '/wallet': '钱包',
  '/mind': '寻思',
  '/creator': '创作者中心',
  '/developer': '开发者中心',
}

export default function PlaceholderPage() {
  const location = useLocation()
  const name = PAGE_NAMES[location.pathname] || '页面'

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <Card style={{ borderRadius: 12, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <Result
          status="info"
          title={name}
          subTitle={`「${name}」功能正在开发中，敬请期待...`}
        />
      </Card>
    </div>
  )
}
