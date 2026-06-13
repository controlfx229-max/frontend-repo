import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import Navbar from '../components/navigation/Navbar'

export default function DesktopLayout() {
  return (
    <div className="desktop-layout">
      <Sidebar />
      <div className="desktop-main">
        <Navbar />
        <main className="desktop-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}