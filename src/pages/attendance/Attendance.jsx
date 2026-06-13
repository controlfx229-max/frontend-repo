import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Calendar, Users, CheckCircle,
  XCircle, ChevronRight, Clock, Filter
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

// ─── TAKE ATTENDANCE MODAL ───────────────────
function TakeAttendanceModal({ service, api, onClose, onSaved }) {
  const [members, setMembers]       = useState([])
  const [attendance, setAttendance] = useState({})
  const [departments, setDepartments] = useState([])
  const [deptFilter, setDeptFilter] = useState('')
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')
  const [markAll, setMarkAll]       = useState(false)

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await api('/departments')
        if (data.success) setDepartments(data.departments)
      } catch {}
    }
    fetchDepts()
  }, [api])

  // Fetch members
  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (deptFilter) params.append('departmentId', deptFilter)

      const data = await api(`/attendance/members/list?${params}`,
        {}
      )
      if (data.success) {
        setMembers(data.members)
        // Default all to present
        const initial = {}
        data.members.forEach(m => { initial[m._id] = 'present' })
        setAttendance(initial)
        setMarkAll(true)
      }
    } catch (err) {
      console.error(err)
      setError('Failed to load members.')
    } finally {
      setLoading(false)
    }
  }, [api, deptFilter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMembers() }, [fetchMembers])

  const toggleMember = (memberId) => {
    setAttendance(prev => ({
      ...prev,
      [memberId]: prev[memberId] === 'present' ? 'absent' : 'present'
    }))
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
        headers: {
          'Content-Type': 'application/json'
        },
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

  return (
    <div className="take-attendance">

      {/* Service Info */}
      <div className="attendance-service-info">
        <div>
          <p className="attendance-service-name">{service.name}</p>
          <p className="attendance-service-date">
            {new Date(service.date).toLocaleDateString('en-GH', {
              weekday: 'long', day: 'numeric',
              month: 'long', year: 'numeric'
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

      {/* Filters */}
      <div className="attendance-filters">
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
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

      {/* Member List */}
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
            const initials  = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
            return (
              <div
                key={member._id}
                className={`attendance-member-row ${isPresent ? 'present' : 'absent'}`}
                onClick={() => toggleMember(member._id)}
              >
                <div className="attendance-member-left">
                  <div className="member-avatar" style={{
                    background: isPresent ? 'var(--success-bg)' : 'var(--surface-2)',
                    color: isPresent ? 'var(--success)' : 'var(--text-muted)'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <p className="member-name">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="member-id">
                      {member.memberId}
                      {member.cellGroupId?.name && (
                        <span className="member-group">
                          · {member.cellGroupId.name}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className={`attendance-toggle ${isPresent ? 'present' : 'absent'}`}>
                  {isPresent
                    ? <CheckCircle size={22} />
                    : <XCircle size={22} />}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Save Button */}
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