import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ConfigProvider, theme, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CheckInDetailPage from './pages/CheckInDetailPage'
import PlaceholderPage from './pages/PlaceholderPage'
import AppLayout from './components/AppLayout'
import { useAuthStore } from './stores/authStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>
}

function AppRoutes() {
  const restore = useAuthStore((s) => s.restore)

  useEffect(() => {
    restore()
  }, [restore])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/checkin/detail" element={<CheckInDetailPage />} />
        <Route path="/explore" element={<PlaceholderPage />} />
        <Route path="/chat" element={<PlaceholderPage />} />
        <Route path="/realm" element={<PlaceholderPage />} />
        <Route path="/account" element={<PlaceholderPage />} />
        <Route path="/drive" element={<PlaceholderPage />} />
        <Route path="/wallet" element={<PlaceholderPage />} />
        <Route path="/mind" element={<PlaceholderPage />} />
        <Route path="/creator" element={<PlaceholderPage />} />
        <Route path="/developer" element={<PlaceholderPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 8,
        },
      }}
    >
      <BrowserRouter>
        <AntApp>
          <AppRoutes />
        </AntApp>
      </BrowserRouter>
    </ConfigProvider>
  )
}
