import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DesktopLayout from './DesktopLayout'
import MobileLayout from './MobileLayout'

export default function AppLayout() {
  const { token, loading } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) return (
    <div className="app-loading">
      <div className="app-loading-spinner" />
    </div>
  )

  if (!token) return <Navigate to="/login" replace />

  return isMobile ? <MobileLayout /> : <DesktopLayout />
}