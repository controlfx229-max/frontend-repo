import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users,
  CalendarCheck, Wallet, Menu
} from 'lucide-react'

const bottomItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { to: '/members',    icon: Users,            label: 'Members' },
  { to: '/attendance', icon: CalendarCheck,    label: 'Attendance' },
  { to: '/finance',    icon: Wallet,           label: 'Finance' },
]

export default function BottomNav({ onMenuClick }) {
  return (
    <nav className="bottom-nav">
      {bottomItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `bottom-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
      <button className="bottom-nav-item" onClick={onMenuClick}>
        <Menu size={22} />
        <span>More</span>
      </button>
    </nav>
  )
}