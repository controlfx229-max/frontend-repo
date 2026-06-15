import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Building2, CheckCircle, XCircle, Clock,
  Users, Wallet, TrendingUp, AlertCircle,
  Shield, RefreshCw, Ban, Play, Search,
  ChevronDown, ChevronUp, MoreVertical,
  LogOut, BarChart3, CreditCard, ArrowUpRight
} from 'lucide-react'

const API = `${import.meta.env.VITE_API_URL.replace('/api/v1', '')}/api/admin/platform`

const formatGHS = (n) =>
  `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`

const timeAgo = (date) => {
  if (!date) return '—'
  const d = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 30) return `${d} days ago`
  return new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const STATUS_STYLES = {
  awaiting_payment: { bg: '#FEF9C3', color: '#713F12', label: 'Awaiting Payment' },
  pending_approval: { bg: '#DBEAFE', color: '#1E40AF', label: 'Pending Approval' },
  approved:         { bg: '#D1FAE5', color: '#065F46', label: 'Approved'         },
  rejected:         { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected'         },
}

const ORG_STATUS_STYLES = {
  trial:            { bg: '#F0FDF4', color: '#166534', label: 'Trial'            },
  active:           { bg: '#D1FAE5', color: '#065F46', label: 'Active'           },
  expired:          { bg: '#FEF3C7', color: '#92400E', label: 'Expired'          },
  pending_approval: { bg: '#DBEAFE', color: '#1E40AF', label: 'Pending'          },
  suspended:        { bg: '#FEE2E2', color: '#991B1B', label: 'Suspended'        },
}

// ── STAT CARD ─────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color = 'var(--primary)' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={18} color={color} />
        </div>
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 'var(--space-1)' }}>
        {value}
      </p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</p>
      {sub && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

// ── CONFIRM DIALOG ────────────────────────────
function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose, loading, danger }) {
  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}><span style={{ fontSize: 18 }}>×</span></button>
        </div>
        <div className="modal-body">
          <div className="confirm-modal-body">
            <div className="confirm-modal-icon" style={{ background: danger ? 'var(--danger-bg)' : 'var(--warning-bg)' }}>
              <AlertCircle size={24} color={danger ? 'var(--danger)' : 'var(--warning)'} />
            </div>
            <p className="confirm-modal-title">{title}</p>
            <p className="confirm-modal-message">{message}</p>
            <div className="confirm-modal-actions">
              <button className="btn-outline" onClick={onClose}>Cancel</button>
              <button
                className={danger ? 'btn-danger' : 'btn-primary'}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── EXTEND SUBSCRIPTION MODAL ─────────────────
function ExtendModal({ org, token, onClose, onSuccess }) {
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/churches/${org._id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ days })
      })
      const data = await res.json()
      if (data.success) onSuccess()
      else setError(data.message)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2 className="modal-title">Extend Subscription</h2>
          <button className="modal-close" onClick={onClose}><span style={{ fontSize: 18 }}>×</span></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-5)' }}>
            Extending subscription for <strong>{org.name}</strong>
          </p>
          {error && <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>{error}</div>}
          <div className="form-group">
            <label className="form-label">Days to add</label>
            <select value={days} onChange={e => setDays(parseInt(e.target.value))} className="form-input">
              {[7, 14, 30, 60, 90, 180, 365].map(d => (
                <option key={d} value={d}>{d} days</option>
              ))}
            </select>
          </div>
          <div className="form-actions" style={{ marginTop: 'var(--space-5)' }}>
            <button className="btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Extending...' : `Add ${days} days`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── PAYMENT ROW ───────────────────────────────
function PaymentRow({ payment, token, onRefresh }) {
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const status = STATUS_STYLES[payment.status] || STATUS_STYLES.awaiting_payment

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/payments/${payment._id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) onRefresh()
    } catch {}
    finally { setLoading(false) }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/payments/${payment._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: rejectReason || 'Payment could not be verified.' })
      })
      const data = await res.json()
      if (data.success) { setShowReject(false); onRefresh() }
    } catch {}
    finally { setLoading(false) }
  }

  const org = payment.organizationId

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
        transition: 'background var(--transition-fast)',
        cursor: 'pointer'
      }}
        onClick={() => setExpanded(e => !e)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Org name */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', marginBottom: 2 }}>
            {org?.name || 'Unknown Church'}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {payment.reference} · {org?.city || '—'}
          </p>
        </div>

        {/* Type */}
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
            {payment.type}
            {payment.plan && ` — ${payment.plan}`}
          </span>
        </div>

        {/* Amount */}
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          GHS {payment.amount}
        </p>

        {/* Status */}
        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: status.bg, color: status.color, flex: 1 }}>
          {status.label}
        </span>

        {/* Date */}
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flex: 1, textAlign: 'right' }}>
          {timeAgo(payment.createdAt)}
        </p>

        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: 'var(--space-4) var(--space-5) var(--space-5)',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {[
              ['Church', org?.name || '—'],
              ['Plan', org?.subscriptionPlan || '—'],
              ['Email', org?.email || '—'],
              ['Transaction ID', payment.transactionId || 'Not submitted yet'],
              ['Submitted', payment.submittedAt ? new Date(payment.submittedAt).toLocaleString('en-GH') : '—'],
              ['Payment type', payment.type],
            ].map(([label, value]) => (
              <div key={label}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{label}</p>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</p>
              </div>
            ))}
          </div>

          {payment.status === 'pending_approval' && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <button
                className="btn-primary"
                onClick={(e) => { e.stopPropagation(); handleApprove() }}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <CheckCircle size={14} /> {loading ? 'Processing...' : 'Approve & Activate'}
              </button>
              <button
                className="btn-danger"
                onClick={(e) => { e.stopPropagation(); setShowReject(true) }}
                disabled={loading}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
              >
                <XCircle size={14} /> Reject
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reject modal */}
      {showReject && (
        <div className="modal-overlay" onClick={() => setShowReject(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Reject Payment</h2>
              <button className="modal-close" onClick={() => setShowReject(false)}><span style={{ fontSize: 18 }}>×</span></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason for rejection</label>
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Transaction ID not found in MoMo records"
                />
              </div>
              <div className="form-actions" style={{ marginTop: 'var(--space-4)' }}>
                <button className="btn-outline" onClick={() => setShowReject(false)}>Cancel</button>
                <button className="btn-danger" onClick={handleReject} disabled={loading}>
                  {loading ? 'Rejecting...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── CHURCH ROW ────────────────────────────────
function ChurchRow({ org, token, onRefresh }) {
  const [expanded, setExpanded] = useState(false)
  const [confirm, setConfirm] = useState(null) // { action }
  const [showExtend, setShowExtend] = useState(false)
  const [loading, setLoading] = useState(false)

  const status = ORG_STATUS_STYLES[org.subscriptionStatus] || ORG_STATUS_STYLES.trial

  const doAction = async (action) => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/churches/${org._id}/${action}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) { setConfirm(null); onRefresh() }
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
        transition: 'background var(--transition-fast)',
        cursor: 'pointer'
      }}
        onClick={() => setExpanded(e => !e)}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          background: 'var(--primary-light)', color: 'var(--primary)',
          fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-sm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {org.name.charAt(0).toUpperCase()}
        </div>

        <div style={{ flex: 2, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)', marginBottom: 2 }}>
            {org.name}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {org.email} · {org.city || '—'}
          </p>
        </div>

        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: status.bg, color: status.color }}>
          {status.label}
        </span>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 500, flex: 1, textTransform: 'capitalize' }}>
          {org.subscriptionPlan}
        </p>

        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', flex: 1, textAlign: 'right' }}>
          {org.subscriptionExpires
            ? new Date(org.subscriptionExpires).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        </p>

        {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </div>

      {expanded && (
        <div style={{
          padding: 'var(--space-4) var(--space-5)',
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap'
        }}>
          <button
            className="btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}
            onClick={(e) => { e.stopPropagation(); setShowExtend(true) }}
          >
            <RefreshCw size={13} /> Extend Subscription
          </button>

          {org.subscriptionStatus !== 'suspended' ? (
            <button
              className="btn-danger"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', padding: '0.5rem var(--space-3)' }}
              onClick={(e) => { e.stopPropagation(); setConfirm('suspend') }}
            >
              <Ban size={13} /> Suspend
            </button>
          ) : (
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}
              onClick={(e) => { e.stopPropagation(); setConfirm('reactivate') }}
            >
              <Play size={13} /> Reactivate
            </button>
          )}
        </div>
      )}

      {confirm === 'suspend' && (
        <ConfirmDialog
          title="Suspend Church?"
          message={`Suspend "${org.name}"? They won't be able to make changes until reactivated.`}
          confirmLabel="Suspend"
          danger
          loading={loading}
          onConfirm={() => doAction('suspend')}
          onClose={() => setConfirm(null)}
        />
      )}

      {confirm === 'reactivate' && (
        <ConfirmDialog
          title="Reactivate Church?"
          message={`Reactivate "${org.name}"? They will regain full access immediately.`}
          confirmLabel="Reactivate"
          loading={loading}
          onConfirm={() => doAction('reactivate')}
          onClose={() => setConfirm(null)}
        />
      )}

      {showExtend && (
        <ExtendModal
          org={org}
          token={token}
          onClose={() => setShowExtend(false)}
          onSuccess={() => { setShowExtend(false); setExpanded(false); onRefresh() }}
        />
      )}
    </>
  )
}

// ── MAIN PLATFORM ADMIN DASHBOARD ────────────
export default function PlatformAdmin() {
  const { user, token, logout } = useAuth()
  const [overview, setOverview] = useState(null)
  const [payments, setPayments] = useState([])
  const [churches, setChurches] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [churchSearch, setChurchSearch] = useState('')
  const [churchStatus, setChurchStatus] = useState('')

  const fetchAll = useCallback(async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [oRes, pRes, cRes] = await Promise.all([
        fetch(`${API}/overview`,  { headers }),
        fetch(`${API}/payments`,  { headers }),
        fetch(`${API}/churches`,  { headers }),
      ])
      const [oData, pData, cData] = await Promise.all([oRes.json(), pRes.json(), cRes.json()])
      if (oData.success) setOverview(oData.overview)
      if (pData.success) setPayments(pData.payments)
      if (cData.success) setChurches(cData.churches)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchAll() }, [fetchAll])

  const filteredPayments = payments.filter(p =>
    paymentFilter ? p.status === paymentFilter : true
  )

  const filteredChurches = churches.filter(c => {
    const matchSearch = !churchSearch || c.name.toLowerCase().includes(churchSearch.toLowerCase()) || c.email?.toLowerCase().includes(churchSearch.toLowerCase())
    const matchStatus = !churchStatus || c.subscriptionStatus === churchStatus
    return matchSearch && matchStatus
  })

  const pendingCount = payments.filter(p => p.status === 'pending_approval').length

  const TABS = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'payments',  label: `Payments${pendingCount > 0 ? ` (${pendingCount})` : ''}` },
    { id: 'churches',  label: 'Churches'  },
  ]

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Loading platform data...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Top navigation */}
      <div style={{
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        padding: '0 var(--space-8)',
        height: 'var(--navbar-height)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 'var(--z-navbar)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={16} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', fontSize: 'var(--text-base)', lineHeight: 1.2 }}>
              MinistryOS Admin
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>EM Control IT Solutions</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {pendingCount > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '4px 12px', borderRadius: 999,
              background: 'var(--warning-bg)', color: 'var(--warning-text)',
              fontSize: 'var(--text-xs)', fontWeight: 700
            }}>
              <Clock size={12} /> {pendingCount} pending approval
            </div>
          )}
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{user?.name}</span>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 'var(--text-sm)', transition: 'all var(--transition-fast)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-bg)'; e.currentTarget.style.color = 'var(--danger)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'var(--space-8)' }}>

        {/* Tabs */}
        <div className="settings-tabs" style={{ marginBottom: 'var(--space-6)' }}>
          {TABS.map(tab => (
            <button key={tab.id} className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
  onClick={() => setActiveTab(tab.id)}>
  {tab.label}   {/* ← no span, never hidden */}
</button>
          ))}
          <button
            className="btn-outline"
            style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}
            onClick={fetchAll}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && overview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
              <StatCard label="Total Churches" value={overview.churches.total} sub={`${overview.churches.active} active`} icon={Building2} color="var(--primary)" />
              <StatCard label="Total Members" value={overview.totalMembers.toLocaleString()} icon={Users} color="var(--success)" />
              <StatCard label="MRR" value={formatGHS(overview.mrrGHS)} sub="Monthly recurring revenue" icon={Wallet} color="var(--accent)" />
              <StatCard label="Pending Approvals" value={overview.pendingPayments} sub="Awaiting review" icon={Clock} color={overview.pendingPayments > 0 ? 'var(--warning)' : 'var(--text-muted)'} />
            </div>

            {/* Church status breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>

              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Church Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {[
                    { label: 'Active', count: overview.churches.active,    color: 'var(--success)' },
                    { label: 'Trial',  count: overview.churches.trial,     color: 'var(--info)'    },
                    { label: 'Expired', count: overview.churches.expired,  color: 'var(--warning)' },
                    { label: 'Suspended', count: overview.churches.suspended, color: 'var(--danger)' },
                  ].map(({ label, count, color }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>{count}</span>
                      <div style={{ width: 80, height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
                        <div style={{ height: '100%', width: `${overview.churches.total > 0 ? (count / overview.churches.total) * 100 : 0}%`, background: color, borderRadius: 999 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent approvals */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-4)' }}>Recent Approvals</h3>
                {overview.recentApprovals?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {overview.recentApprovals.slice(0, 5).map(p => (
                      <div key={p._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.organizationId?.name || '—'}</p>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{p.reference} · {timeAgo(p.reviewedAt)}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>GHS {p.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No recent approvals.</p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)} className="filter-select">
                <option value="">All Statuses</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="awaiting_payment">Awaiting Payment</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {/* Table header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--surface-2)', borderBottom: '1px solid var(--border)'
              }}>
                {['Church', 'Type', 'Amount', 'Status', 'Date', ''].map((h, i) => (
                  <p key={i} style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    flex: i === 0 ? 2 : 1
                  }}>{h}</p>
                ))}
              </div>

              {filteredPayments.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                  <div className="empty-state-icon"><CreditCard size={24} color="var(--text-muted)" /></div>
                  <p className="empty-state-title">No payments found</p>
                </div>
              ) : (
                filteredPayments.map(p => (
                  <PaymentRow key={p._id} payment={p} token={token} onRefresh={fetchAll} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── CHURCHES ── */}
        {activeTab === 'churches' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <div className="search-wrap" style={{ flex: 1, minWidth: 200 }}>
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search churches..."
                  value={churchSearch}
                  onChange={e => setChurchSearch(e.target.value)}
                  className="search-input"
                />
              </div>
              <select value={churchStatus} onChange={e => setChurchStatus(e.target.value)} className="filter-select">
                <option value="">All Statuses</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="suspended">Suspended</option>
              </select>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', alignSelf: 'center' }}>
                {filteredChurches.length} church{filteredChurches.length !== 1 ? 'es' : ''}
              </p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-3) var(--space-5)',
                background: 'var(--surface-2)', borderBottom: '1px solid var(--border)'
              }}>
                <div style={{ width: 36, flexShrink: 0 }} />
                {['Church', 'Status', 'Plan', 'Expires', ''].map((h, i) => (
                  <p key={i} style={{
                    fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    flex: i === 0 ? 2 : 1
                  }}>{h}</p>
                ))}
              </div>

              {filteredChurches.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
                  <div className="empty-state-icon"><Building2 size={24} color="var(--text-muted)" /></div>
                  <p className="empty-state-title">No churches found</p>
                </div>
              ) : (
                filteredChurches.map(org => (
                  <ChurchRow key={org._id} org={org} token={token} onRefresh={fetchAll} />
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}