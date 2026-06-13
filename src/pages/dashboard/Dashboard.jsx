import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import {
  Users, TrendingUp, Wallet, CalendarCheck,
  UserPlus, AlertCircle, TrendingDown,
  Calendar, Gift, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// ─── HELPERS ─────────────────────────────────
const formatGHS = (v) =>
  `GHS ${parseFloat(v || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60)  return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60)  return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24)    return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7)      return `${days}d ago`
  return new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
}

const EVENT_TYPE_COLORS = {
  sunday_service: '#4F46E5', midweek_service: '#0891B2',
  prayer_meeting: '#7C3AED', conference: '#D97706',
  revival: '#DC2626', outreach: '#059669',
  wedding: '#EC4899', funeral: '#64748B',
  other: '#94A3B8'
}

// ─── STAT CARD ────────────────────────────────
function StatCard({ icon: Icon, label, value, trend, trendLabel, color }) {
  // Cap unrealistic trends
  const displayTrend = trend !== undefined && Math.abs(trend) > 999 ? null : trend

  return (
    <div className="stat-card animate-fadeIn">
      <div className="stat-card-top">
        <div className="stat-card-icon" style={{ background: color + '18' }}>
          <Icon size={20} color={color} />
        </div>
        {displayTrend !== undefined && displayTrend !== null && displayTrend !== 0 && (
          <span className={`stat-trend ${displayTrend >= 0 ? 'up' : 'down'}`}>
            {displayTrend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(displayTrend)}%
          </span>
        )}
      </div>
      <p className="stat-card-value">{value}</p>
      <p className="stat-card-label">{label}</p>
      {trendLabel && <p className="stat-card-sublabel">{trendLabel}</p>}
    </div>
  )
}

// ─── HEALTH SCORE ─────────────────────────────
function HealthScore({ health, loading }) {
  const score  = health?.score || 0
  const factors = health?.factors || {}

  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  const label = score >= 75 ? 'Healthy' : score >= 50 ? 'Fair' : 'Needs Attention'

  const factorList = [
    { label: 'Attendance Rate',    value: factors.attendanceRate    || 0, color: 'var(--success)' },
    { label: 'Giving Consistency', value: factors.givingConsistency || 0, color: 'var(--warning)' },
    { label: 'Member Growth',      value: factors.memberGrowth      || 0, color: 'var(--info)'    },
    { label: 'Active Rate',        value: factors.followUpRate      || 0, color: 'var(--primary)' },
  ]

  return (
    <div className="health-score-card animate-fadeIn">
      <div className="health-score-header">
        <div>
          <h3>Church Health Score</h3>
          <p>Based on attendance, giving & growth</p>
        </div>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="health-score-body">
          <div className="health-ring-wrap">
            <svg viewBox="0 0 120 120" className="health-ring">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="10" />
              <circle cx="60" cy="60" r="50"
                fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="health-ring-label">
              <span className="health-ring-value" style={{ color }}>{score}</span>
              <span className="health-ring-status">{label}</span>
            </div>
          </div>
          <div className="health-factors">
            {factorList.map(f => (
              <div className="health-factor-item" key={f.label}>
                <span className="health-factor-label">{f.label}</span>
                <div className="health-factor-bar-wrap">
                  <div className="health-factor-bar"
                    style={{ width: `${Math.min(f.value, 100)}%`, background: f.color }} />
                </div>
                <span className="health-factor-value">{f.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UPCOMING EVENTS WIDGET ───────────────────
function UpcomingEvents({ events, loading, onNavigate }) {
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GH', {
    weekday: 'short', day: 'numeric', month: 'short'
  })

  return (
    <div className="activity-card animate-fadeIn">
      <div className="activity-header">
        <h3>Upcoming Events</h3>
        <button className="btn-ghost" onClick={() => onNavigate('/events')}>View all</button>
      </div>
      {loading ? <LoadingSpinner /> : events.length === 0 ? (
        <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
          <Calendar size={28} color="var(--text-muted)" style={{ margin: '0 auto var(--space-2)' }} />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No upcoming events</p>
          <button className="btn-ghost" onClick={() => onNavigate('/events')} style={{ marginTop: 'var(--space-2)' }}>
            + Create Event
          </button>
        </div>
      ) : (
        <div className="activity-list">
          {events.map((e, i) => (
            <div key={e._id} className="activity-item">
              <div className="activity-icon"
                style={{ background: (e.color || EVENT_TYPE_COLORS[e.eventType] || '#4F46E5') + '18' }}>
                <Calendar size={15} color={e.color || EVENT_TYPE_COLORS[e.eventType] || '#4F46E5'} />
              </div>
              <div className="activity-body">
                <p className="activity-text">{e.title}</p>
                <p className="activity-time">
                  {formatDate(e.startDate)}
                  {e.startTime && ` · ${e.startTime}`}
                  {e.location && ` · ${e.location}`}
                </p>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 7px',
                borderRadius: 999, whiteSpace: 'nowrap', flexShrink: 0,
                background: e.status === 'ongoing' ? '#D1FAE5' : '#DBEAFE',
                color: e.status === 'ongoing' ? '#065F46' : '#1E40AF'
              }}>
                {e.status === 'ongoing' ? 'Ongoing' : 'Upcoming'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── RECENT ACTIVITY WIDGET ───────────────────
function RecentActivity({ activities, todayBirthdays, loading, onNavigate }) {
  const ICONS = {
    member:     { icon: UserPlus,      color: 'var(--primary)' },
    offering:   { icon: Wallet,        color: 'var(--accent)'  },
    expense:    { icon: TrendingDown,  color: 'var(--danger)'  },
    attendance: { icon: CalendarCheck, color: 'var(--success)' },
  }

  return (
    <div className="activity-card animate-fadeIn">
      <div className="activity-header">
        <h3>Recent Activity</h3>
        <button className="btn-ghost" onClick={() => onNavigate('/members')}>View all</button>
      </div>

      {/* Today's Birthdays */}
      {todayBirthdays?.length > 0 && (
        <div style={{
          margin: '0 var(--space-4) var(--space-3)',
          padding: 'var(--space-3)',
          background: '#FEF3C7', borderRadius: 'var(--radius-md)',
          border: '1px solid #FDE68A'
        }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
            🎂 Birthdays Today
          </p>
          {todayBirthdays.map((b, i) => (
            <p key={i} style={{ fontSize: 'var(--text-sm)', color: '#78350F', fontWeight: 600 }}>
              🎉 {b.name}
            </p>
          ))}
        </div>
      )}

      {loading ? <LoadingSpinner /> : activities.length === 0 ? (
        <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          No recent activity yet.
        </p>
      ) : (
        <div className="activity-list">
          {activities.map((a, i) => {
            const { icon: Icon, color } = ICONS[a.type] || ICONS.member
            return (
              <div key={i} className="activity-item">
                <div className="activity-icon" style={{ background: color + '18' }}>
                  <Icon size={15} color={color} />
                </div>
                <div className="activity-body">
                  <p className="activity-text">{a.text}</p>
                  <p className="activity-time">{timeAgo(a.time)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const { api, branchReady } = useApi()
  const navigate = useNavigate()

  const [stats, setStats]           = useState(null)
  const [finance, setFinance]       = useState(null)
  const [expSummary, setExpSummary] = useState(null)
  const [health, setHealth]         = useState(null)
  const [activity, setActivity]     = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [todayBirthdays, setTodayBirthdays] = useState([])
  const [loading, setLoading]       = useState(true)
  const [activityLoading, setActivityLoading] = useState(true)
  const [healthLoading, setHealthLoading]     = useState(true)

  const fetchAll = useCallback(async () => {
    if (!branchReady) return

    try {
      const [statsData, financeData, expData] = await Promise.all([
        api('/members/stats'),
        api('/finance/summary'),
        api('/expenses/summary'),
      ])

      if (statsData?.success)   setStats(statsData.stats)
      if (financeData?.success) setFinance(financeData.summary)
      if (expData?.success)     setExpSummary(expData.summary)
    } catch (err) { console.error('❌ Failed to fetch core stats:', err) }
    finally { setLoading(false) }

    try {
      const data = await api('/dashboard/activity')
      if (data?.success) {
        setActivity(data.activities)
        setUpcomingEvents(data.upcomingEvents)
        setTodayBirthdays(data.todayBirthdays)
      }
    } catch (err) { console.error('❌ Failed to fetch activity:', err) }
    finally { setActivityLoading(false) }

    try {
      const data = await api('/dashboard/health')
      if (data?.success) setHealth(data.health)
    } catch (err) { console.error('❌ Failed to fetch health:', err) }
    finally { setHealthLoading(false) }

  }, [api, branchReady])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Net balance this month
  const incomeMonth   = finance?.thisMonth      || 0
  const expensesMonth = expSummary?.thisMonth   || 0
  const netMonth      = incomeMonth - expensesMonth
  const weekVariance  = finance?.weekVariance && Math.abs(finance.weekVariance) <= 999
    ? finance.weekVariance : null

  return (
    <div className="dashboard">

      {/* Header */}
      <div className="dashboard-header animate-fadeIn">
        <div>
          <h1 className="dashboard-greeting">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="dashboard-sub">
            Here's what's happening at {user?.churchName} today.
          </p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/members')}>
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon={Users}        label="Total Members"
          value={loading ? '—' : stats?.total ?? 0}
          color="var(--primary)" trendLabel="registered members" />

        <StatCard icon={CalendarCheck} label="Active Members"
          value={loading ? '—' : stats?.active ?? 0}
          color="var(--success)" trendLabel="currently active" />

        <StatCard icon={UserPlus}     label="New This Month"
          value={loading ? '—' : stats?.joinedThisMonth ?? 0}
          color="var(--info)" trendLabel="joined this month" />

        <StatCard icon={AlertCircle}  label="Inactive Members"
          value={loading ? '—' : stats?.inactive ?? 0}
          color="var(--warning)" trendLabel="need follow-up" />

        <StatCard icon={Wallet}       label="Offerings This Week"
          value={loading ? '—' : formatGHS(finance?.thisWeek)}
          trend={weekVariance}
          trendLabel="vs last week"
          color="var(--accent)" />

        <StatCard
          icon={netMonth >= 0 ? TrendingUp : TrendingDown}
          label="Net Balance (Month)"
          value={loading ? '—' : formatGHS(netMonth)}
          trendLabel={netMonth >= 0 ? '▲ Surplus' : '▼ Deficit'}
          color={netMonth >= 0 ? 'var(--success)' : 'var(--danger)'} />
      </div>

      {/* Bottom — 3 columns */}
      <div className="dashboard-bottom-grid">
        <HealthScore health={health} loading={healthLoading} />
        <UpcomingEvents events={upcomingEvents} loading={activityLoading} onNavigate={navigate} />
        <RecentActivity activities={activity} todayBirthdays={todayBirthdays} loading={activityLoading} onNavigate={navigate} />
      </div>
    </div>
  )
}