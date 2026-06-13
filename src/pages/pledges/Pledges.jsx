import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, CheckCircle, Clock, AlertCircle,
  Search, ChevronLeft, ChevronRight,
  Wallet, TrendingUp, Users, HandCoins
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── HELPERS ─────────────────────────────────
const formatGHS = (v) =>
  `GHS ${parseFloat(v || 0).toLocaleString('en-GH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  })}`

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GH', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  : '—'

// ─── CONSTANTS ───────────────────────────────
const PLEDGE_TYPES = [
  { value: 'building_fund',    label: 'Building Fund'    },
  { value: 'harvest',          label: 'Harvest / Homcoming' },
  { value: 'special_project',  label: 'Special Project'  },
  { value: 'welfare',          label: 'Welfare'          },
  { value: 'thanksgiving',     label: 'Thanksgiving'     },
  { value: 'other',            label: 'Other'            },
]

const STATUS_STYLES = {
  active:    { bg: '#DBEAFE', color: '#1E40AF', label: 'Active',    icon: Clock         },
  fulfilled: { bg: '#D1FAE5', color: '#065F46', label: 'Fulfilled', icon: CheckCircle   },
  overdue:   { bg: '#FEE2E2', color: '#991B1B', label: 'Overdue',   icon: AlertCircle   },
  cancelled: { bg: '#F1F5F9', color: '#475569', label: 'Cancelled', icon: AlertCircle   },
}

// ─── PROGRESS BAR ─────────────────────────────
function ProgressBar({ paid, total }) {
  const pct   = total > 0 ? Math.min((paid / total) * 100, 100) : 0
  const color = pct >= 100 ? 'var(--success)'
              : pct >= 50  ? 'var(--primary)'
              : 'var(--warning)'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {formatGHS(paid)} paid
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>
          {Math.round(pct)}%
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999 }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 999,
          transition: 'width 0.8s ease'
        }} />
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        Balance: {formatGHS(parseFloat(total) - parseFloat(paid))}
      </p>
    </div>
  )
}

// ─── CREATE PLEDGE FORM ───────────────────────
function CreatePledgeForm({ api, onSuccess, onClose }) {
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [members, setMembers]   = useState([])
  const [search, setSearch]     = useState('')
  const [form, setForm] = useState({
    memberId:      '',
    pledgeType:    'building_fund',
    description:   '',
    pledgedAmount: '',
    dueDate:       '',
    notes:         ''
  })

  // Fetch members for dropdown
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await api(`/members?limit=200&search=${search}`,
          {}
        )
        if (data.success) setMembers(data.members)
      } catch (err) { console.error(err) }
    }
    fetchMembers()
  }, [api, search])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.memberId)      { setError('Please select a member.');       return }
    if (!form.pledgedAmount) { setError('Please enter the pledge amount.'); return }

    setLoading(true)
    try {
      const data = await api('/pledges', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess()
    } catch (err) { console.error(err); setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <p className="form-section-title">Pledge Details</p>

        {/* Member search */}
        <div className="form-group">
          <label className="form-label">Member *</label>
          <input
            placeholder="Search member by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ marginBottom: 'var(--space-2)' }}
          />
          {members.length > 0 && search && (
            <div style={{
              border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
              maxHeight: 180, overflowY: 'auto', background: 'var(--surface)'
            }}>
              {members.slice(0, 8).map(m => (
                <div key={m._id}
                  onClick={() => {
                    setForm(prev => ({ ...prev, memberId: m._id }))
                    setSearch(`${m.firstName} ${m.lastName}`)
                    setMembers([])
                  }}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    cursor: 'pointer', fontSize: 'var(--text-sm)',
                    borderBottom: '1px solid var(--border)',
                    background: form.memberId === m._id ? 'var(--primary-light)' : 'transparent',
                    color: form.memberId === m._id ? 'var(--primary)' : 'var(--text-primary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background =
                    form.memberId === m._id ? 'var(--primary-light)' : 'transparent'}
                >
                  <span style={{ fontWeight: 600 }}>{m.firstName} {m.lastName}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 8, fontSize: 11 }}>
                    {m.memberId}
                  </span>
                </div>
              ))}
            </div>
          )}
          {form.memberId && !members.length && (
            <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>
              ✓ Member selected
            </p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Pledge Type *</label>
            <select name="pledgeType" value={form.pledgeType}
              onChange={handleChange} className="form-input">
              {PLEDGE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount Pledged (GHS) *</label>
            <input name="pledgedAmount" type="number" step="0.01" min="0"
              value={form.pledgedAmount} onChange={handleChange}
              className="form-input" placeholder="0.00" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Description</label>
            <input name="description" value={form.description}
              onChange={handleChange} className="form-input"
              placeholder="e.g. Harvest pledge 2025" />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date (optional)</label>
            <input name="dueDate" type="date" value={form.dueDate}
              onChange={handleChange} className="form-input" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <input name="notes" value={form.notes} onChange={handleChange}
            className="form-input" placeholder="Any additional notes" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Record Pledge'}
        </button>
      </div>
    </form>
  )
}

// ─── RECORD PAYMENT FORM ──────────────────────
function RecordPaymentForm({ pledge, api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    amount:        '',
    paymentMethod: 'cash',
    notes:         ''
  })

  const balance = parseFloat(pledge.balanceGHS || 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount.')
      return
    }
    if (parseFloat(form.amount) > balance) {
      setError(`Amount cannot exceed the balance of ${formatGHS(balance)}.`)
      return
    }
    setLoading(true)
    try {
      const data = await api(`/pledges/${pledge._id}/pay`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form)
        }
      )
      if (!data.success) { setError(data.message); return }
      onSuccess(data.message)
    } catch (err) { console.error(err); setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      {/* Pledge summary */}
      <div style={{
        background: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4)', marginBottom: 'var(--space-4)'
      }}>
        <p style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 'var(--text-sm)' }}>
          {pledge.memberId?.firstName} {pledge.memberId?.lastName}
        </p>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', marginTop: 4 }}>
          {PLEDGE_TYPES.find(t => t.value === pledge.pledgeType)?.label} —
          Pledged: {formatGHS(pledge.pledgedAmountGHS)} ·
          Paid: {formatGHS(pledge.paidAmountGHS)} ·
          Balance: <strong>{formatGHS(balance)}</strong>
        </p>
      </div>

      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Payment Amount (GHS) *</label>
            <input type="number" step="0.01" min="0.01" max={balance}
              value={form.amount}
              onChange={e => { setForm(p => ({ ...p, amount: e.target.value })); setError('') }}
              className="form-input" placeholder="0.00" />
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select value={form.paymentMethod}
              onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
              className="form-input">
              <option value="cash">Cash</option>
              <option value="momo">Mobile Money</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes (optional)</label>
          <input value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className="form-input" placeholder="e.g. Part payment" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Recording...' : 'Record Payment'}
        </button>
      </div>
    </form>
  )
}

// ─── PLEDGE CARD ──────────────────────────────
function PledgeCard({ pledge, onPay, onView }) {
  const statusConfig = STATUS_STYLES[pledge.status] || STATUS_STYLES.active
  const StatusIcon   = statusConfig.icon
  const typeLabel    = PLEDGE_TYPES.find(t => t.value === pledge.pledgeType)?.label || pledge.pledgeType

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Colored top bar */}
      <div style={{ height: 4, background: pledge.status === 'fulfilled' ? 'var(--success)' : pledge.status === 'overdue' ? 'var(--danger)' : 'var(--primary)' }} />

      <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        {/* Member + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="member-avatar" style={{ width: 40, height: 40, fontSize: 14 }}>
              {pledge.memberId?.firstName?.[0]}{pledge.memberId?.lastName?.[0]}
            </div>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                {pledge.memberId?.firstName} {pledge.memberId?.lastName}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {pledge.memberId?.memberId}
              </p>
            </div>
          </div>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, fontWeight: 700, padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            background: statusConfig.bg, color: statusConfig.color
          }}>
            <StatusIcon size={11} />
            {statusConfig.label}
          </span>
        </div>

        {/* Type + amount */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{typeLabel}</p>
            {pledge.description && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                {pledge.description}
              </p>
            )}
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)',
            fontWeight: 800, color: 'var(--text-primary)'
          }}>
            {formatGHS(pledge.pledgedAmountGHS)}
          </p>
        </div>

        {/* Progress */}
        <ProgressBar
          paid={parseFloat(pledge.paidAmountGHS)}
          total={parseFloat(pledge.pledgedAmountGHS)}
        />

        {/* Due date */}
        {pledge.dueDate && (
          <p style={{ fontSize: 11, color: pledge.status === 'overdue' ? 'var(--danger)' : 'var(--text-muted)' }}>
            {pledge.status === 'overdue' ? '⚠️ Due:' : '📅 Due:'} {formatDate(pledge.dueDate)}
          </p>
        )}

        {/* Actions */}
        {pledge.status !== 'fulfilled' && pledge.status !== 'cancelled' && (
          <button className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => onPay(pledge)}>
            <Wallet size={14} /> Record Payment
          </button>
        )}

        {pledge.status === 'fulfilled' && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 6, padding: 'var(--space-2)',
            background: 'var(--success-bg)', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--success-text)'
          }}>
            <CheckCircle size={14} /> Pledge Fully Paid
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────
export default function Pledges() {
  const { api, branchReady } = useApi()
  const [pledges, setPledges]       = useState([])
  const [summary, setSummary]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('')
  const [typeFilter, setType]       = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [payTarget, setPayTarget]   = useState(null)
  const [successMsg, setSuccessMsg] = useState('')
  const limit = 12

  const fetchSummary = useCallback(async () => {
    if (!branchReady) return
    try {
      const data = await api('/pledges/summary')
      if (data.success) setSummary(data.summary)
    } catch (err) { console.error(err) }
  }, [api, branchReady])

  const fetchPledges = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit })
      if (statusFilter) params.append('status',      statusFilter)
      if (typeFilter)   params.append('pledgeType',  typeFilter)

      const data = await api(`/pledges?${params}`)
      if (data.success) {
        setPledges(data.pledges)
        setTotal(data.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady, page, statusFilter, typeFilter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchSummary() },  [fetchSummary])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPledges() },  [fetchPledges])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1) },      [statusFilter, typeFilter])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const totalPages = Math.ceil(total / limit)

  // Summary cards
  const summaryCards = [
    {
      label: 'Total Pledged',
      value: formatGHS(summary?.totalPledged),
      color: 'var(--primary)', icon: TrendingUp
    },
    {
      label: 'Total Collected',
      value: formatGHS(summary?.totalPaid),
      color: 'var(--success)', icon: CheckCircle
    },
    {
      label: 'Outstanding Balance',
      value: formatGHS(summary?.totalBalance),
      color: 'var(--warning)', icon: Clock
    },
    {
      label: 'Active Pledges',
      value: summary?.byStatus?.find(s => s.status === 'active')?.count ?? 0,
      color: 'var(--info)', icon: Users
    },
  ]

  // Collection rate
  const collectionRate = summary?.totalPledged > 0
    ? Math.round((summary.totalPaid / summary.totalPledged) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Toast */}
      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pledges</h1>
          <p className="page-subtitle">Track member pledges and payments</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Pledge
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}
        className="pledges-stats-grid">
        {summaryCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-sm)', display: 'flex',
            alignItems: 'center', gap: 'var(--space-4)'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: color + '18', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
                fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1
              }}>
                {value}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Collection Rate Bar */}
      {summary && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <div>
              <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                Overall Collection Rate
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                {formatGHS(summary.totalPaid)} collected of {formatGHS(summary.totalPledged)} pledged
              </p>
            </div>
            <p style={{
              fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)',
              fontWeight: 800, color: collectionRate >= 75 ? 'var(--success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)'
            }}>
              {collectionRate}%
            </p>
          </div>
          <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 999 }}>
            <div style={{
              height: '100%', borderRadius: 999,
              width: `${collectionRate}%`,
              background: collectionRate >= 75 ? 'var(--success)' : collectionRate >= 50 ? 'var(--warning)' : 'var(--danger)',
              transition: 'width 1s ease'
            }} />
          </div>

          {/* Status breakdown pills */}
          {summary.byStatus?.length > 0 && (
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              {summary.byStatus.map(s => {
                const cfg = STATUS_STYLES[s.status] || STATUS_STYLES.active
                return (
                  <div key={s.status} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '4px 12px', borderRadius: 'var(--radius-full)',
                    background: cfg.bg
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: cfg.color }}>
                      {s.count}
                    </span>
                    <span style={{ fontSize: 10, color: cfg.color }}>
                      · {formatGHS(s.totalPledged)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="filter-select">
          <option value="">All Statuses</option>
          {Object.entries(STATUS_STYLES).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
        <select value={typeFilter} onChange={e => setType(e.target.value)}
          className="filter-select">
          <option value="">All Types</option>
          {PLEDGE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Pledges Grid */}
      {loading ? (
        <LoadingSpinner message="Loading pledges..." />
      ) : pledges.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No pledges recorded yet"
          message="Record a member's pledge and track their payments over time."
          action={{ label: '+ New Pledge', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)'
        }} className="pledges-grid">
          {pledges.map(p => (
            <PledgeCard
              key={p._id}
              pledge={p}
              onPay={setPayTarget}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}>
            <ChevronLeft size={16} />
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button className="page-btn"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Create Pledge Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}
        title="Record New Pledge" size="lg">
        <CreatePledgeForm api={api}
          onSuccess={() => {
            setShowCreate(false)
            fetchPledges()
            fetchSummary()
            showSuccess('Pledge recorded successfully.')
          }}
          onClose={() => setShowCreate(false)} />
      </Modal>

      {/* Record Payment Modal */}
      <Modal open={!!payTarget} onClose={() => setPayTarget(null)}
        title="Record Pledge Payment" size="md">
        {payTarget && (
          <RecordPaymentForm
            pledge={payTarget}
            api={api}
            onSuccess={(msg) => {
              setPayTarget(null)
              fetchPledges()
              fetchSummary()
              showSuccess(msg)
            }}
            onClose={() => setPayTarget(null)} />
        )}
      </Modal>
    </div>
  )
}