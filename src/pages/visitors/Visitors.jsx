import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  UserCheck, Plus, Search, CheckCircle,
  Phone, Calendar, ChevronLeft, ChevronRight,
  UserPlus, Clock, AlertCircle, X
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── CONSTANTS ────────────────────────────────
const FOLLOW_UP_STYLES = {
  pending:   { bg: '#FEF3C7', color: '#92400E', label: 'Pending'   },
  contacted: { bg: '#DBEAFE', color: '#1E40AF', label: 'Contacted' },
  visited:   { bg: '#EDE9FE', color: '#6D28D9', label: 'Visited'   },
  converted: { bg: '#D1FAE5', color: '#065F46', label: 'Converted' },
  inactive:  { bg: '#F1F5F9', color: '#475569', label: 'Inactive'  },
}

const SERVICE_LABELS = {
  sunday_service:   'Sunday Service',
  midweek_service:  'Midweek Service',
  special_service:  'Special Service',
  prayer_meeting:   'Prayer Meeting',
  conference:       'Conference',
  other:            'Other',
}

const HEARD_LABELS = {
  friend:         'Friend / Word of mouth',
  family:         'Family',
  social_media:   'Social Media',
  flyer:          'Flyer / Poster',
  walked_in:      'Walked in',
  online_service: 'Online Service',
  other:          'Other',
}

// ─── ADD VISITOR FORM ─────────────────────────
function AddVisitorForm({ api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    firstName:    '',
    lastName:     '',
    phone:        '',
    email:        '',
    gender:       '',
    address:      '',
    occupation:   '',
    serviceType:  'sunday_service',
    howTheyHeard: 'walked_in',
    visitDate:    new Date().toISOString().split('T')[0],
    notes:        ''
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.phone) {
      setError('First name and phone are required.')
      return
    }
    setLoading(true)
    try {
      const data = await api('/visitors', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess()
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <p className="form-section-title">Personal Information</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange}
              className="form-input" placeholder="e.g. Kwame" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange}
              className="form-input" placeholder="e.g. Asante" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="form-input" placeholder="024XXXXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="form-input" placeholder="optional" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input name="occupation" value={form.occupation} onChange={handleChange}
              className="form-input" placeholder="optional" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="form-input" placeholder="optional" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Visit Details</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Visit Date</label>
            <input name="visitDate" type="date" value={form.visitDate}
              onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Service Attended</label>
            <select name="serviceType" value={form.serviceType}
              onChange={handleChange} className="form-input">
              {Object.entries(SERVICE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">How did they hear about us?</label>
          <select name="howTheyHeard" value={form.howTheyHeard}
            onChange={handleChange} className="form-input">
            {Object.entries(HEARD_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
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
          {loading ? 'Saving...' : 'Record Visitor'}
        </button>
      </div>
    </form>
  )
}

// ─── FOLLOW UP MODAL ──────────────────────────
function FollowUpModal({ visitor, api, onSuccess, onClose }) {
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const [form, setForm] = useState({
    followUpStatus: visitor.followUpStatus || 'pending',
    followUpNote:   visitor.followUpNote   || '',
    followUpDate:   new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api(`/visitors/${visitor._id}/followup`,
        {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form)
        }
      )
      if (!data.success) { setError(data.message); return }
      onSuccess()
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-section">
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
          Updating follow-up for <strong>{visitor.firstName} {visitor.lastName}</strong>
        </p>
        <div className="form-group">
          <label className="form-label">Follow-up Status</label>
          <select name="followUpStatus" value={form.followUpStatus}
            onChange={e => setForm(p => ({ ...p, followUpStatus: e.target.value }))}
            className="form-input">
            {Object.entries(FOLLOW_UP_STYLES).map(([v, { label }]) => (
              <option key={v} value={v}>{label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Follow-up Date</label>
          <input type="date" value={form.followUpDate}
            onChange={e => setForm(p => ({ ...p, followUpDate: e.target.value }))}
            className="form-input" />
        </div>
        <div className="form-group">
          <label className="form-label">Note</label>
          <input value={form.followUpNote}
            onChange={e => setForm(p => ({ ...p, followUpNote: e.target.value }))}
            className="form-input"
            placeholder="e.g. Called, no answer. Will try again Sunday." />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Update Follow-up'}
        </button>
      </div>
    </form>
  )
}

// ─── VISITOR CARD ─────────────────────────────
function VisitorCard({ visitor, onFollowUp, onConvert, onDelete }) {
  const status  = FOLLOW_UP_STYLES[visitor.followUpStatus] || FOLLOW_UP_STYLES.pending
  const formatDate = (d) => new Date(d).toLocaleDateString('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="member-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
            {visitor.firstName[0]}{visitor.lastName?.[0] || ''}
          </div>
          <div>
            <p style={{ fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
              {visitor.firstName} {visitor.lastName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 2 }}>
              <Phone size={11} color="var(--text-muted)" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{visitor.phone}</span>
            </div>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: status.bg, color: status.color
        }}>
          {status.label}
        </span>
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={11} /> {formatDate(visitor.visitDate)}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {SERVICE_LABELS[visitor.serviceType] || visitor.serviceType}
        </span>
        {visitor.howTheyHeard && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            via {HEARD_LABELS[visitor.howTheyHeard] || visitor.howTheyHeard}
          </span>
        )}
      </div>

      {/* Follow-up note */}
      {visitor.followUpNote && (
        <p style={{
          fontSize: 'var(--text-xs)', color: 'var(--text-secondary)',
          background: 'var(--surface-2)', padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--primary)'
        }}>
          {visitor.followUpNote}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border)' }}>
        <button className="btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-xs)', padding: '6px' }}
          onClick={() => onFollowUp(visitor)}>
          <Clock size={13} /> Follow Up
        </button>
        {!visitor.convertedToMember && (
          <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 'var(--text-xs)', padding: '6px' }}
            onClick={() => onConvert(visitor)}>
            <UserPlus size={13} /> Convert
          </button>
        )}
        {visitor.convertedToMember && (
          <span style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 4, fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 600
          }}>
            <CheckCircle size={13} /> Member
          </span>
        )}
        <button onClick={() => onDelete(visitor)} style={{
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', border: '1.5px solid var(--border)',
          background: 'none', cursor: 'pointer', flexShrink: 0
        }}>
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────
export default function Visitors() {
  const { api, branchReady } = useApi()
  const [visitors, setVisitors]       = useState([])
  const [stats, setStats]             = useState(null)
  const [loading, setLoading]         = useState(true)
  const [total, setTotal]             = useState(0)
  const [page, setPage]               = useState(1)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showAdd, setShowAdd]         = useState(false)
  const [followUpTarget, setFollowUpTarget] = useState(null)
  const [convertTarget, setConvertTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget]     = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [converting, setConverting]   = useState(false)
  const [successMsg, setSuccessMsg]   = useState('')
  const limit = 12

  const fetchStats = useCallback(async () => {
    if (!branchReady) return
    try {
      const data = await api('/visitors/stats')
      if (data.success) setStats(data.stats)
    } catch (err) { console.error(err) }
  }, [api, branchReady])

  const fetchVisitors = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit })
      if (search)       params.append('search',        search)
      if (statusFilter) params.append('followUpStatus', statusFilter)

      const data = await api(`/visitors?${params}`)
      if (data.success) {
        setVisitors(data.visitors)
        setTotal(data.total)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady, page, search, statusFilter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchStats() },    [fetchStats])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchVisitors() }, [fetchVisitors])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1) },      [search, statusFilter])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api(`/visitors/${deleteTarget._id}`, {
        method: 'DELETE', 
      })
      setDeleteTarget(null)
      fetchVisitors()
      fetchStats()
      showSuccess('Visitor deleted.')
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  const handleConvert = async () => {
    setConverting(true)
    try {
      const data = await api(`/visitors/${convertTarget._id}/convert`, { method: 'POST' })
      if (!data.success) { showSuccess('Conversion failed.'); return }
      setConvertTarget(null)
      fetchVisitors()
      fetchStats()
      showSuccess(`${convertTarget.firstName} converted to member successfully!`)
    } catch (err) { console.error(err) }
    finally { setConverting(false) }
  }

  const totalPages = Math.ceil(total / limit)

  const statCards = [
    { label: 'Total Visitors',   value: stats?.total     ?? 0, color: 'var(--primary)', icon: UserCheck  },
    { label: 'This Month',       value: stats?.thisMonth ?? 0, color: 'var(--info)',    icon: Calendar   },
    { label: 'Pending Follow-up',value: stats?.pending   ?? 0, color: 'var(--warning)', icon: AlertCircle},
    { label: 'Converted',        value: stats?.converted ?? 0, color: 'var(--success)', icon: CheckCircle},
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Success Toast */}
      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitors</h1>
          <p className="page-subtitle">Track first-timers and manage follow-ups</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Record Visitor
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}
        className="visitors-stats-grid">
        {statCards.map(({ label, value, color, icon: Icon }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-md)',
              background: color + '18', display: 'flex',
              alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="search-input" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="filter-select">
          <option value="">All Statuses</option>
          {Object.entries(FOLLOW_UP_STYLES).map(([v, { label }]) => (
            <option key={v} value={v}>{label}</option>
          ))}
        </select>
      </div>

      {/* Visitors Grid */}
      {loading ? (
        <LoadingSpinner message="Loading visitors..." />
      ) : visitors.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No visitors recorded yet"
          message="Record your first visitor to start tracking follow-ups."
          action={{ label: '+ Record Visitor', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--space-4)'
        }} className="visitors-grid">
          {visitors.map(v => (
            <VisitorCard
              key={v._id}
              visitor={v}
              onFollowUp={setFollowUpTarget}
              onConvert={setConvertTarget}
              onDelete={setDeleteTarget}
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

      {/* Add Visitor Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}
        title="Record New Visitor" size="lg">
        <AddVisitorForm api={api}
          onSuccess={() => {
            setShowAdd(false)
            fetchVisitors()
            fetchStats()
            showSuccess('Visitor recorded successfully.')
          }}
          onClose={() => setShowAdd(false)} />
      </Modal>

      {/* Follow-up Modal */}
      <Modal open={!!followUpTarget} onClose={() => setFollowUpTarget(null)}
        title="Update Follow-up" size="md">
        {followUpTarget && (
          <FollowUpModal
            visitor={followUpTarget}
            api={api}
            onSuccess={() => {
              setFollowUpTarget(null)
              fetchVisitors()
              showSuccess('Follow-up updated.')
            }}
            onClose={() => setFollowUpTarget(null)} />
        )}
      </Modal>

      {/* Convert Confirm */}
      <ConfirmModal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConfirm={handleConvert}
        loading={converting}
        title="Convert to Member?"
        confirmLabel="Convert"
        message={convertTarget
          ? `Convert ${convertTarget.firstName} ${convertTarget.lastName} to a new member? Their details will be copied over automatically.`
          : ''}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Visitor?"
        confirmLabel="Delete"
        message={deleteTarget
          ? `Delete ${deleteTarget.firstName} ${deleteTarget.lastName}? This cannot be undone.`
          : ''}
      />
    </div>
  )
}