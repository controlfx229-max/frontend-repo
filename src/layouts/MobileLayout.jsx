import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/navigation/Navbar'
import BottomNav from '../components/navigation/BottomNav'
import Drawer from '../components/navigation/Drawer'

export default function MobileLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="mobile-layout">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />
      <main className="mobile-content">
        <Outlet />
      </main>
      <BottomNav onMenuClick={() => setDrawerOpen(true)} />
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}