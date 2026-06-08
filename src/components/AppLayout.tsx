import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  CompassOutlined,
  CommentOutlined,
  GlobalOutlined,
  UserOutlined,
  CloudOutlined,
  WalletOutlined,
  BulbOutlined,
  RocketOutlined,
  CodeOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { logout } from '../services/authService'

const { Sider, Content } = Layout
const { Text } = Typography

const MENU_ITEMS = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/explore', icon: <CompassOutlined />, label: '探索' },
  { key: '/chat', icon: <CommentOutlined />, label: '聊天' },
  { key: '/realm', icon: <GlobalOutlined />, label: '领域' },
  { key: '/account', icon: <UserOutlined />, label: '账号' },
  { key: '/drive', icon: <CloudOutlined />, label: '云盘' },
  { key: '/wallet', icon: <WalletOutlined />, label: '钱包' },
  { key: '/mind', icon: <BulbOutlined />, label: '寻思' },
  { key: '/creator', icon: <RocketOutlined />, label: '创作者中心' },
  { key: '/developer', icon: <CodeOutlined />, label: '开发者中心' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearToken, isGuest } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // ignore
    }
    clearToken()
    navigate('/login', { replace: true })
  }

  const handleLogin = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
        width={200}
        collapsedWidth={60}
        style={{
          borderRight: '1px solid #f0f0f0',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 10,
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid #f0f0f0',
            margin: '0 8px',
          }}
        >
          <img
            src="/favicon.png"
            alt="Solian"
            style={{
              height: collapsed ? 32 : 36,
              width: collapsed ? 32 : 36,
              objectFit: 'contain',
            }}
          />
          {!collapsed && (
            <Text
              strong
              style={{
                fontSize: 15,
                color: '#1677ff',
                whiteSpace: 'nowrap',
                marginLeft: 8,
              }}
            >
              Solian
            </Text>
          )}
        </div>

        {/* 导航菜单 */}
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={MENU_ITEMS}
          onClick={handleMenuClick}
          style={{ border: 'none', marginTop: 4 }}
        />

        {/* 底部菜单 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: '1px solid #f0f0f0',
            padding: '8px 12px',
          }}
        >
          <Menu
            mode="inline"
            selectable={false}
            items={[
              isGuest
                ? {
                    key: 'login',
                    icon: <UserOutlined />,
                    label: '登录',
                    onClick: handleLogin,
                  }
                : {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: '退出',
                    onClick: handleLogout,
                  },
            ]}
            style={{ border: 'none' }}
          />
        </div>
      </Sider>

      <Content
        style={{
          marginLeft: collapsed ? 60 : 200,
          transition: 'margin-left 0.2s',
          background: '#f5f6fa',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  )
}
