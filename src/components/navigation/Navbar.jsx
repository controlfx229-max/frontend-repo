import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu, Bell, Search, X, ChevronDown,
  GitBranch, Check, Users, Building2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useBranch } from '../../context/BranchContext'
import useApi from '../../hooks/useApi'

// ─── SEARCH MODAL ─────────────────────────────
function SearchModal({ api, branchReady, onClose }) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!branchReady || !query.trim() || query.length < 2) { setResults(null); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api(`/members?search=${encodeURIComponent(query)}&limit=6`)
        if (data.success) setResults(data.members)
      } catch {}
      finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [query, api, branchReady])

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-modal-input-wrap">
          <Search size={18} color="var(--text-muted)" />
          <input
            ref={inputRef}
            className="search-modal-input"
            placeholder="Search members by name, ID, or phone..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {loading && <div className="search-modal-spinner" />}
          {query && !loading && (
            <button className="search-modal-clear" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {results !== null && (
          <div className="search-results">
            {results.length === 0 ? (
              <div className="search-no-results">
                <Search size={28} />
                <p>No members found for "{query}"</p>
              </div>
            ) : (
              <div className="search-result-group">
                <p className="search-result-group-label">
                  <Users size={11} /> Members
                </p>
                {results.map(m => (
                  <div key={m._id} className="search-result-item" onClick={onClose}>
                    <div className="search-result-avatar">
                      {m.firstName[0]}{m.lastName[0]}
                    </div>
                    <div className="search-result-info">
                      <p className="search-result-name">
                        {m.firstName} {m.lastName}
                      </p>
                      <p className="search-result-sub">
                        {m.memberId} · {m.phone}
                        {m.departmentId?.name && ` · ${m.departmentId.name}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!results && (
          <div className="search-hint">
            <span>Type at least 2 characters to search</span>
            <kbd>ESC</kbd>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BRANCH SWITCHER ──────────────────────────
function BranchSwitcher() {
  const { branches, activeBranch, switchBranch, canSeeAllBranches, loading } = useBranch()
  const [open, setOpen] = useState(false)
  const ref             = useRef(null)
  const navigate        = useNavigate()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Don't render if only 1 branch and user can't add more
  if (!canSeeAllBranches && branches.length <= 1) return null
  if (loading) return null

  const displayName = activeBranch ? activeBranch.name : 'All Branches'
  const displayIcon = activeBranch?.isMain ? '🏛️' : activeBranch ? '🏢' : '🌐'

  return (
    <div className="branch-switcher" ref={ref}>
      <button
        className="branch-switcher-btn"
        onClick={() => setOpen(o => !o)}
      >
        <GitBranch size={13} color="var(--primary)" />
        <span className="branch-switcher-name">{displayName}</span>
        <ChevronDown
          size={13}
          color="var(--text-muted)"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {open && (
        <div className="branch-dropdown">
          <p className="branch-dropdown-label">Switch Branch</p>

          {/* All Branches option — only for superadmin/pastor */}
          {canSeeAllBranches && (
            <button
              className={`branch-dropdown-item ${!activeBranch ? 'active' : ''}`}
              onClick={() => { switchBranch(null); setOpen(false); navigate(0) }}
            >
              <div className="branch-dropdown-icon">🌐</div>
              <div className="branch-dropdown-info">
                <p className="branch-dropdown-name">All Branches</p>
                <p className="branch-dropdown-sub">
                  {branches.reduce((s, b) => s + (b.memberCount || 0), 0)} total members
                </p>
              </div>
              {!activeBranch && <Check size={14} color="var(--primary)" />}
            </button>
          )}

          {/* Individual branches */}
          {branches.map(branch => (
            <button
              key={branch._id}
              className={`branch-dropdown-item ${activeBranch?._id === branch._id ? 'active' : ''}`}
              onClick={() => { switchBranch(branch); setOpen(false); navigate(0) }}
            >
              <div className="branch-dropdown-icon">
                {branch.isMain ? '🏛️' : '🏢'}
              </div>
              <div className="branch-dropdown-info">
                <p className="branch-dropdown-name">
                  {branch.name}
                  {branch.isMain && (
                    <span className="branch-main-badge">Main</span>
                  )}
                </p>
                <p className="branch-dropdown-sub">
                  {branch.memberCount} member{branch.memberCount !== 1 ? 's' : ''}
                  {branch.city && ` · ${branch.city}`}
                </p>
              </div>
              {activeBranch?._id === branch._id && (
                <Check size={14} color="var(--primary)" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── NOTIFICATIONS DROPDOWN ───────────────────
function NotificationsDropdown({ api, branchReady, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!branchReady) return
    const load = async () => {
      try {
        const data = await api('/dashboard/activity')
        if (data.success) {
          const items = []
          if (data.todayBirthdays?.length > 0) {
            data.todayBirthdays.forEach(b => {
              items.push({ type: 'birthday', text: `🎂 ${b.name}'s birthday today!`, time: new Date() })
            })
          }
          data.activities?.slice(0, 5).forEach(a => {
            items.push({ type: a.type, text: a.text, time: a.time })
          })
          setNotifications(items)
        }
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [api, branchReady])

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60)    return 'Just now'
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
  }

  const iconMap = {
    birthday:   '🎂',
    member:     '👤',
    offering:   '💰',
    expense:    '📤',
    attendance: '✅',
  }

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <p className="notif-title">Notifications</p>
        {notifications.length > 0 && (
          <span className="notif-count-badge">{notifications.length}</span>
        )}
      </div>
      <div className="notif-body">
        {loading ? (
          <div className="notif-loading">
            <div className="spinner" style={{ width: 24, height: 24 }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={28} />
            <p>No recent activity</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className={`notif-item ${n.type === 'birthday' ? 'notif-birthday' : ''}`}>
              <div className="notif-icon">{iconMap[n.type] || '📌'}</div>
              <div className="notif-info">
                <p className="notif-text">{n.text}</p>
                <p className="notif-time">{timeAgo(n.time)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="notif-footer">
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={onClose}>
          View all activity →
        </button>
      </div>
    </div>
  )
}

// ─── PROFILE DROPDOWN ─────────────────────────
function ProfileDropdown({ user, onLogout, onClose }) {
  const navigate = useNavigate()
  return (
    <div className="profile-dropdown">
      <div className="profile-dropdown-header">
        <div className="profile-dropdown-avatar">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="profile-dropdown-info">
          <p className="profile-dropdown-name">{user?.name}</p>
          <p className="profile-dropdown-role">{user?.role}</p>
          <p className="profile-dropdown-church">{user?.churchName}</p>
        </div>
      </div>
      <div className="profile-dropdown-divider" />
      <div className="profile-dropdown-menu">
        <button
          className="profile-dropdown-item"
          onClick={() => { navigate('/settings'); onClose() }}
        >
          <Building2 size={15} /> Settings
        </button>
      </div>
      <div className="profile-dropdown-divider" />
      <div className="profile-dropdown-menu">
        <button className="profile-dropdown-logout" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </div>
  )
}

// ─── MAIN NAVBAR ──────────────────────────────
export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { api, branchReady } = useApi()
  const [showSearch, setShowSearch]   = useState(false)
  const [showNotifs, setShowNotifs]   = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notifRef   = useRef(null)
  const profileRef = useRef(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!notifRef.current?.contains(e.target))   setShowNotifs(false)
      if (!profileRef.current?.contains(e.target)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Ctrl+K shortcut for search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      <header className="navbar">

        {/* Left */}
        <div className="navbar-left">
          <button
            className="navbar-menu-btn"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          {/* Church name */}
          <div className="navbar-church">
            <p className="navbar-church-name">{user?.churchName}</p>
            <p className="navbar-church-plan" style={{ textTransform: 'capitalize' }}>
              {user?.subscriptionPlan || 'Starter'} Plan · {user?.subscriptionStatus || 'Trial'}
            </p>
          </div>

          {/* Branch Switcher — sits right next to church name */}
          <BranchSwitcher />
        </div>

        {/* Right */}
        <div className="navbar-right">

          {/* Search */}
          <button
            className={`navbar-icon-btn ${showSearch ? 'navbar-icon-btn--active' : ''}`}
            onClick={() => setShowSearch(true)}
            aria-label="Search (Ctrl+K)"
          >
            <Search size={20} />
          </button>

          {/* Notifications */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className={`navbar-icon-btn ${showNotifs ? 'navbar-icon-btn--active' : ''}`}
              onClick={() => { setShowNotifs(o => !o); setShowProfile(false) }}
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="navbar-badge">3</span>
            </button>
            {showNotifs && (
              <NotificationsDropdown
                api={api}
                branchReady={branchReady}
                onClose={() => setShowNotifs(false)}
              />
            )}
          </div>

          {/* Profile */}
          <div style={{ position: 'relative' }} ref={profileRef}>
            <div
              className={`navbar-avatar ${showProfile ? 'navbar-avatar--active' : ''}`}
              onClick={() => { setShowProfile(o => !o); setShowNotifs(false) }}
              style={{ cursor: 'pointer' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {showProfile && (
              <ProfileDropdown
                user={user}
                onLogout={logout}
                onClose={() => setShowProfile(false)}
              />
            )}
          </div>

        </div>
      </header>

      {/* Search Modal */}
      {showSearch && (
        <SearchModal
          api={api}
          branchReady={branchReady}
          onClose={() => setShowSearch(false)}
        />
      )}
    </>
  )
}