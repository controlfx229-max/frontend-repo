import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, CalendarCheck, Wallet,
  MessageSquare, Building2, CalendarDays,
  BarChart3, Settings, LogOut, Zap,
  UserCheck, HandCoins, CreditCard, AlertCircle, ClipboardList
} from 'lucide-react'
import Logo from '../../components/Logo'

const FULL_ACCESS_STATUSES = ['trial', 'active', 'pending_approval']
const isRestricted = !!status && !FULL_ACCESS_STATUSES.includes(status)

const allNavItems = [
  { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'      },
  { to: '/members',        icon: Users,            label: 'Members'        },
  { to: '/visitors',       icon: UserCheck,        label: 'Visitors'       },
  { to: '/attendance',     icon: CalendarCheck,    label: 'Attendance'     },
  { to: '/finance',        icon: Wallet,           label: 'Finance'        },
  { to: '/pledges',        icon: HandCoins,        label: 'Pledges'        },
  { to: '/communications', icon: MessageSquare,    label: 'Communications' },
  { to: '/departments',    icon: Building2,        label: 'Departments'    },
  { to: '/events',         icon: CalendarDays,     label: 'Events'         },
  { to: '/reports',        icon: BarChart3,        label: 'Reports'        },
  { to: '/audit',          icon: ClipboardList,   label: 'Audit Log'      },
  { to: '/automations',    icon: Zap,              label: 'Automations'    },
  { to: '/settings',       icon: Settings,         label: 'Settings'       },
]

const billingOnlyItems = [
  { to: '/billing', icon: CreditCard, label: 'Billing' },
]

const STATUS_LABELS = {
  expired:          'Subscription Expired',
  suspended:        'Account Suspended',
  pending_payment:  'Payment Pending',
  pending_approval: 'Awaiting Approval',
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()

  const status      = user?.subscriptionStatus
  const isRestricted = !FULL_ACCESS_STATUSES.includes(status)
  const navItems    = isRestricted ? billingOnlyItems : allNavItems

  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <Logo
          title="MinistryOS"
          subtitle={user?.churchName || 'Your Church'}
          className="sidebar-brand-logo"
          size={20}
        />
      </div>

      {/* Restricted mode banner */}
      {isRestricted && (
        <div style={{
          margin: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--danger)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)'
        }}>
          <AlertCircle size={14} color="var(--danger)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--danger-text)' }}>
              {STATUS_LABELS[status] || 'Access Restricted'}
            </p>
            <p style={{ fontSize: 10, color: 'var(--danger-text)', marginTop: 2, lineHeight: 1.4 }}>
              Renew your subscription to restore full access. Your data is safe.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {!isRestricted && (
          <p className="sidebar-nav-label">Main Menu</p>
        )}

        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        {/* Show billing link in full nav too */}
        {!isRestricted && (
          <>
            <p className="sidebar-nav-label" style={{ marginTop: 'var(--space-2)' }}>Account</p>
            <NavLink
              to="/billing"
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <CreditCard size={18} />
              <span>Billing</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* User + Logout */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user?.name}</p>
            <p className="sidebar-user-role">{user?.role}</p>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

    </aside>
  )
}