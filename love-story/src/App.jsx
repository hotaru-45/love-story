import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { HashRouter, Navigate, Routes, Route, useNavigate } from 'react-router-dom'
import { App as AntdApp, ConfigProvider } from 'antd'
import PreferencesProvider from './components/PreferencesProvider'
import UnlockProvider from './components/UnlockProvider'
import LoveStoryDataProvider from './components/LoveStoryDataProvider'
import Login from './pages/Login'
import Experience from './pages/Experience'
import { usePreferences } from './hooks/preferencesContext'
import { clearAuthenticated, isAuthenticated, AUTH_EXPIRED_EVENT } from './utils/auth'

// Lắng nghe sự kiện phát ra khi API phát hiện token hết hạn (xem
// `utils/auth.js#notifyAuthExpired`) và điều hướng về trang Login thay vì để
// người dùng đứng đơ trên màn hình báo lỗi "not authenticated".
function AuthExpiryWatcher() {
  const navigate = useNavigate()

  useEffect(() => {
    function handleAuthExpired() {
      navigate('/', { replace: true })
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [navigate])

  return null
}

function LoginRoute() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <Login />
}

function HomeRoute() {
  const navigate = useNavigate()

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />
  }

  function handleRelock() {
    clearAuthenticated()
    navigate('/', { replace: true })
  }

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#fb7185', borderRadius: 16 } }}>
      <AntdApp>
        <LoveStoryDataProvider>
          <UnlockProvider>
            <Experience onRelock={handleRelock} />
          </UnlockProvider>
        </LoveStoryDataProvider>
      </AntdApp>
    </ConfigProvider>
  )
}

function App() {
  const { reducedMotion } = usePreferences()

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'never'}>
      <HashRouter>
        <AuthExpiryWatcher />
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route path="/home" element={<HomeRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </MotionConfig>
  )
}

function Root() {
  return (
    <PreferencesProvider>
      <App />
    </PreferencesProvider>
  )
}

export default Root
