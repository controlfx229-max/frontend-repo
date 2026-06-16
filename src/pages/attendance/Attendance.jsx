import { useState, useEffect, useCallback, useRef } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Calendar, Users, CheckCircle,
  XCircle, ChevronRight, Clock, Filter,
  Phone, UserPlus
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── SERVICE TYPE BADGE ──────────────────────
function ServiceTypeBadge({ type }) {
  const map = {
    sunday:       { label: 'Sunday',    color: '#4F46E5', bg: '#EEF2FF' },
    midweek:      { label: 'Midweek',   color: '#0891B2', bg: '#E0F2FE' },
    special:      { label: 'Special',   color: '#D97706', bg: '#FEF3C7' },
    prayer:       { label: 'Prayer',    color: '#7C3AED', bg: '#F5F3FF' },
    youth:        { label: 'Youth',     color: '#059669', bg: '#D1FAE5' },
    cell_meeting: { label: 'Cell',      color: '#DB2777', bg: '#FCE7F3' },
  }
  const config = map[type] || { label: type, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="service-type-badge" style={{
      color: config.color,
      background: config.bg
    }}>
      {config.label}
    </span>
  )
}

// ─── CREATE SERVICE FORM ─────────────────────
function CreateServiceForm({ api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({
    name: '', serviceType: 'sunday',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 AM', notes: ''
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await api('/attendance/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.service)
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Service Type *</label>
            <select name="serviceType" value={form.serviceType}
              onChange={handleChange} className="form-input">
              <option value="sunday">Sunday Service</option>
              <option value="midweek">Midweek Service</option>
              <option value="prayer">Prayer Meeting</option>
              <option value="youth">Youth Service</option>
              <option value="special">Special Service</option>
              <option value="cell_meeting">Cell Meeting</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Custom Name (optional)</label>
            <input name="name" value={form.name}
              onChange={handleChange} className="form-input"
              placeholder="e.g. Easter Sunday Service" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input name="date" type="date" value={form.date}
              onChange={handleChange} className="form-input" required />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input name="time" value={form.time}
              onChange={handleChange} className="form-input"
              placeholder="e.g. 9:00 AM" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input name="notes" value={form.notes}
            onChange={handleChange} className="form-input"
            placeholder="Any special notes about this service" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Service'}
        </button>
      </div>
    </form>
  )
}

 function TakeAttendanceModal({ service, api, onClose, onSaved }) {
  const [members, setMembers]         = useState([])
  const [attendance, setAttendance]   = useState({})
  const [departments, setDepartments] = useState([])
  const [deptFilter, setDeptFilter]   = useState('')
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [markAll, setMarkAll]         = useState(false)
 
  // ── Phone/name quick search ──
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState(null) // null | 'found' | 'not_found'
  const [matchedMember, setMatchedMember] = useState(null)
  const searchRef = useRef(null)
 
  // Focus search input on open
  useEffect(() => { searchRef.current?.focus() }, [])
 
  // Fetch departments
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await api('/departments')
        if (data.success) setDepartments(data.departments)
      } catch {}
    }
    fetchDepts()
  }, [api])
 
  // Fetch members list
  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (deptFilter) params.append('departmentId', deptFilter)
      const data = await api(`/attendance/members/list?${params}`)
      if (data.success) {
        setMembers(data.members)
        // Default all to present
        const initial = {}
        data.members.forEach(m => { initial[m._id] = 'present' })
        setAttendance(initial)
        setMarkAll(true)
      }
    } catch {
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }, [api, deptFilter])
 
  useEffect(() => { fetchMembers() }, [fetchMembers])
 
  // ── Live search: match by phone or name as usher types ──
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q || q.length < 2) {
      setSearchResult(null)
      setMatchedMember(null)
      return
    }
 
    // Search loaded members list — no extra API call needed
    const found = members.find(m =>
      m.phone?.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      m.whatsapp?.replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
    )
 
    if (found) {
      setMatchedMember(found)
      setSearchResult('found')
    } else {
      setMatchedMember(null)
      setSearchResult('not_found')
    }
  }, [searchQuery, members])
 
  const toggleMember = (memberId) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: prev[memberId] === 'present' ? 'absent' : 'present'
    }))
  }
 
  // One-tap mark present from search result
  const markSearchedPresent = () => {
    if (!matchedMember) return
    setAttendance(prev => ({ ...prev, [matchedMember._id]: 'present' }))
    setSearchQuery('')
    setSearchResult(null)
    setMatchedMember(null)
    searchRef.current?.focus()
  }
 
  const handleMarkAll = () => {
    const newStatus = markAll ? 'absent' : 'present'
    const updated = {}
    members.forEach(m => { updated[m._id] = newStatus })
    setAttendance(updated)
    setMarkAll(!markAll)
  }
 
  const handleSave = async () => {
    setSaving(true)
    try {
      const records = members.map(m => ({
        memberId: m._id,
        status: attendance[m._id] || 'absent'
      }))
      const data = await api('/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service._id, records })
      })
      if (!data.success) { setError(data.message); return }
      onSaved(data.message)
    } catch {
      setError('Failed to save attendance.')
    } finally {
      setSaving(false)
    }
  }
 
  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount  = members.length - presentCount
 
  const initials = (m) => `${m.firstName[0]}${m.lastName[0]}`.toUpperCase()
 
  return (
    <div className="take-attendance">
 
      {/* ── Service Info ── */}
      <div className="attendance-service-info">
        <div>
          <p className="attendance-service-name">{service.name}</p>
          <p className="attendance-service-date">
            {new Date(service.date).toLocaleDateString('en-GH', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })} · {service.time}
          </p>
        </div>
        <div className="attendance-summary-pills">
          <span className="attendance-pill present">
            <CheckCircle size={13} /> {presentCount} Present
          </span>
          <span className="attendance-pill absent">
            <XCircle size={13} /> {absentCount} Absent
          </span>
        </div>
      </div>
 
      {/* ── Phone / Name Quick Search ── */}
      <div style={{
        background: 'var(--surface-2)',
        border: '2px solid var(--primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)'
      }}>
        <p style={{
          fontSize: 'var(--text-xs)',
          fontWeight: 700,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          📞 Quick Check-in
        </p>
 
        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <Phone size={15} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }} />
          <input
            ref={searchRef}
            type="tel"
            inputMode="numeric"
            placeholder="Member's phone number or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.7rem 1rem 0.7rem 2.5rem',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              background: 'var(--surface)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResult(null); searchRef.current?.focus() }}
              style={{
                position: 'absolute', right: 10, top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--surface-2)', border: 'none',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-muted)'
              }}
            >
              <XCircle size={14} />
            </button>
          )}
        </div>
 
        {/* ── Search result ── */}
        {searchResult === 'found' && matchedMember && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            background: attendance[matchedMember._id] === 'present'
              ? '#F0FDF4' : 'var(--surface)',
            border: `2px solid ${attendance[matchedMember._id] === 'present'
              ? 'var(--success)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)',
            transition: 'all 0.2s ease'
          }}>
            {/* Avatar */}
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: attendance[matchedMember._id] === 'present'
                ? 'var(--success-bg)' : 'var(--primary-light)',
              color: attendance[matchedMember._id] === 'present'
                ? 'var(--success)' : 'var(--primary)',
              fontWeight: 800, fontSize: 'var(--text-base)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              {initials(matchedMember)}
            </div>
 
            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontWeight: 700, color: 'var(--text-primary)',
                fontSize: 'var(--text-sm)'
              }}>
                {matchedMember.firstName} {matchedMember.lastName}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {matchedMember.memberId} · {matchedMember.phone}
              </p>
            </div>
 
            {/* Action button */}
            {attendance[matchedMember._id] === 'present' ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: 'var(--success)', fontWeight: 700,
                fontSize: 'var(--text-sm)'
              }}>
                <CheckCircle size={20} />
                Present
              </div>
            ) : (
              <button
                className="btn-primary"
                onClick={markSearchedPresent}
                style={{ whiteSpace: 'nowrap', fontSize: 'var(--text-sm)' }}
              >
                <CheckCircle size={14} /> Mark Present
              </button>
            )}
          </div>
        )}
 
        {/* Already marked present — show confirmation + clear */}
        {searchResult === 'found' && matchedMember &&
          attendance[matchedMember._id] === 'present' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => { setSearchQuery(''); setSearchResult(null); searchRef.current?.focus() }}
              style={{
                fontSize: 'var(--text-xs)', color: 'var(--primary)',
                background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Next member →
            </button>
          </div>
        )}
 
        {/* Not found */}
        {searchResult === 'not_found' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--danger-bg)',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3) var(--space-4)'
          }}>
            <div>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--danger-text)' }}>
                Not found in system
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-text)', opacity: 0.8 }}>
                This person is not a registered member
              </p>
            </div>
            <a
              href="/members"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 'var(--text-xs)', fontWeight: 700,
                color: 'var(--danger)', whiteSpace: 'nowrap',
                textDecoration: 'none',
                background: 'white', border: '1px solid #FECACA',
                padding: '6px 12px', borderRadius: 'var(--radius-md)'
              }}
            >
              <UserPlus size={13} /> Add Member
            </a>
          </div>
        )}
      </div>
 
      {/* ── Filters + Mark All ── */}
      <div className="attendance-filters">
        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>
        <button className="btn-outline" onClick={handleMarkAll}>
          {markAll ? 'Mark All Absent' : 'Mark All Present'}
        </button>
      </div>
 
      {error && <div className="form-error">{error}</div>}
 
      {/* ── Full Member List (backup) ── */}
      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Full Member List
      </div>
 
      {loading ? (
        <LoadingSpinner message="Loading members..." />
      ) : members.length === 0 ? (
        <EmptyState
          title="No members found"
          message="No active members to mark attendance for."
        />
      ) : (
        <div className="attendance-member-list">
          {members.map(member => {
            const isPresent = attendance[member._id] === 'present'
            const isHighlighted = matchedMember?._id === member._id
            return (
              <div
                key={member._id}
                className={`attendance-member-row ${isPresent ? 'present' : 'absent'}`}
                onClick={() => toggleMember(member._id)}
                style={isHighlighted ? { outline: '2px solid var(--primary)' } : undefined}
              >
                <div className="attendance-member-left">
                  <div className="member-avatar" style={{
                    background: isPresent ? 'var(--success-bg)' : 'var(--surface-2)',
                    color: isPresent ? 'var(--success)' : 'var(--text-muted)'
                  }}>
                    {initials(member)}
                  </div>
                  <div>
                    <p className="member-name">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="member-id">
                      {member.memberId} · {member.phone}
                      {member.cellGroupId?.name && (
                        <span className="member-group"> · {member.cellGroupId.name}</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={`attendance-toggle ${isPresent ? 'present' : 'absent'}`}>
                  {isPresent ? <CheckCircle size={22} /> : <XCircle size={22} />}
                </div>
              </div>
            )
          })}
        </div>
      )}
 
      {/* ── Save Bar ── */}
      <div className="attendance-save-bar">
        <p className="attendance-save-info">
          {presentCount} of {members.length} marked present
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || members.length === 0}
          >
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SERVICE CARD ────────────────────────────
function ServiceCard({ service, onTakeAttendance, onView }) {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-GH', {
    weekday: 'short', day: 'numeric',
    month: 'short', year: 'numeric'
  })

  const attendanceRate = service.totalExpected > 0
    ? Math.round((service.totalPresent / service.totalExpected) * 100)
    : null

  const isFutureService = new Date(service.date) > new Date()

  return (
    <div className="service-card">
      <div className="service-card-left">
        <div className="service-card-icon">
          <Calendar size={18} color="var(--primary)" />
        </div>
        <div>
          <div className="service-card-name-row">
            <p className="service-card-name">{service.name}</p>
            <ServiceTypeBadge type={service.serviceType} />
            {isFutureService && (
              <span className="service-future-chip" style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 999,
                background: '#F3F4F6',
                color: '#475569',
                marginLeft: '0.5rem'
              }}>
                Future service
              </span>
            )}
          </div>
          <div className="service-card-meta">
            <span><Calendar size={12} /> {formatDate(service.date)}</span>
            {service.time && <span><Clock size={12} /> {service.time}</span>}
            {service.attendanceTaken && (
              <span className="service-present-count">
                <Users size={12} /> {service.totalPresent} present
              </span>
            )}
          </div>
          {attendanceRate !== null && (
            <div className="service-attendance-bar-wrap">
              <div
                className="service-attendance-bar"
                style={{
                  width: `${attendanceRate}%`,
                  background: attendanceRate >= 75
                    ? 'var(--success)'
                    : attendanceRate >= 50
                    ? 'var(--warning)'
                    : 'var(--danger)'
                }}
              />
              <span className="service-attendance-rate">
                {attendanceRate}% attendance
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="service-card-actions">
        {!service.attendanceTaken ? (
          <button
            className="btn-primary"
            onClick={() => onTakeAttendance(service)}
            disabled={isFutureService}
            style={isFutureService ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            title={isFutureService ? 'Cannot take attendance for a future service' : 'Take Attendance'}
          >
            Take Attendance
          </button>
        ) : (
          <button
            className="btn-outline"
            onClick={() => onTakeAttendance(service)}
          >
            Update
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MAIN ATTENDANCE PAGE ────────────────────
export default function Attendance() {
  const { api, branchReady } = useApi()
  const [services, setServices]             = useState([])
  const [loading, setLoading]               = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeService, setActiveService]   = useState(null)
  const [successMsg, setSuccessMsg]         = useState('')

  const fetchServices = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const data = await api('/attendance/services')
      if (data.success) setServices(data.services)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [api, branchReady])

  useEffect(() => { fetchServices() }, [fetchServices])

  const handleServiceCreated = (service) => {
    setShowCreateModal(false)
    fetchServices()
    setActiveService(service)
  }

  const handleAttendanceSaved = (message) => {
    setActiveService(null)
    setSuccessMsg(message)
    fetchServices()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Stats
  const totalServices  = services.length
  const avgAttendance  = services.filter(s => s.attendanceTaken).length > 0
    ? Math.round(
        services
          .filter(s => s.attendanceTaken)
          .reduce((sum, s) => sum + (s.totalPresent / Math.max(s.totalExpected, 1)) * 100, 0)
        / services.filter(s => s.attendanceTaken).length
      )
    : 0

  return (
    <div className="attendance-page">

      {/* Success Toast */}
      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            {totalServices} services recorded
            {avgAttendance > 0 && ` · ${avgAttendance}% average attendance`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} />
          New Service
        </button>
      </div>

      {/* Quick Stats */}
      <div className="attendance-stats-row">
        {[
          {
            label: 'Total Services',
            value: totalServices,
            icon: Calendar,
            color: 'var(--primary)'
          },
          {
            label: 'Avg Attendance Rate',
            value: `${avgAttendance}%`,
            icon: Users,
            color: 'var(--success)'
          },
          {
            label: 'Pending Attendance',
            value: services.filter(s => !s.attendanceTaken).length,
            icon: XCircle,
            color: 'var(--warning)'
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="attendance-stat-card" key={label}>
            <div className="attendance-stat-icon" style={{ background: color + '18' }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <p className="attendance-stat-value">{value}</p>
              <p className="attendance-stat-label">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Services List */}
      <div className="services-list-wrap">
        <div className="services-list-header">
          <h3>Services</h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading services..." />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No services yet"
            message="Create your first service to start taking attendance."
            action={{
              label: '+ New Service',
              onClick: () => setShowCreateModal(true)
            }}
          />
        ) : (
          <div className="services-list">
            {services.map(service => (
              <ServiceCard
                key={service._id}
                service={service}
                onTakeAttendance={setActiveService}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Service Modal */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Service"
        size="md"
      >
        <CreateServiceForm
          api={api}
          onSuccess={handleServiceCreated}
          onClose={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Take Attendance Modal */}
      <Modal
        open={!!activeService}
        onClose={() => setActiveService(null)}
        title="Take Attendance"
        size="lg"
      >
        {activeService && (
          <TakeAttendanceModal
            service={activeService}
            api={api}
            onClose={() => setActiveService(null)}
            onSaved={handleAttendanceSaved}
          />
        )}
      </Modal>

    </div>
  )
}