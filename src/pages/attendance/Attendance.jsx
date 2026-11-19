import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import {
  Plus, Calendar, Users, CheckCircle,
  XCircle, Clock
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ServiceMode from './ServiceMode'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import { fmtDate, todayISO } from '../../utils/dates'

// ─── SERVICE TYPE BADGE ──────────────────────
function ServiceTypeBadge({ type }) {
  const map = {
    sunday:       { label: 'Sunday Service', color: '#2563EB', bg: '#DBEAFE' },
    midweek:      { label: 'Midweek',        color: '#0891B2', bg: '#E0F2FE' },
    special:      { label: 'Special',        color: '#D97706', bg: '#FEF3C7' },
    prayer:       { label: 'Prayer',         color: '#7C3AED', bg: '#F5F3FF' },
    youth:        { label: 'Youth',          color: '#059669', bg: '#D1FAE5' },
    cell_meeting: { label: 'Cell Meeting',   color: '#DB2777', bg: '#FCE7F3' },
  }
  const config = map[type] || { label: type, color: '#64748B', bg: '#F1F5F9' }
  return (
    <span className="service-type-badge" style={{ color: config.color, background: config.bg }}>
      {config.label}
    </span>
  )
}

// ─── CREATE SERVICE FORM ─────────────────────
function CreateServiceForm({ api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name: '', serviceType: 'sunday',
    date: todayISO(),
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
        headers: { 'Content-Type': 'application/json' },
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
            <input name="name" value={form.name} onChange={handleChange}
              className="form-input" placeholder="e.g. Easter Sunday Service" />
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
            <input name="time" value={form.time} onChange={handleChange}
              className="form-input" placeholder="e.g. 9:00 AM" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <input name="notes" value={form.notes} onChange={handleChange}
            className="form-input" placeholder="Any special notes about this service" />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Creating...' : 'Create Service'}
        </button>
      </div>
    </form>
  )
}

// ─── SERVICE CARD ────────────────────────────
function ServiceCard({ service, onTakeAttendance }) {
  const formatDate = (date) => fmtDate(date, {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
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
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px',
                borderRadius: 999, background: '#F3F4F6', color: '#475569',
                marginLeft: '0.5rem'
              }}>
                Upcoming
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
              <span className="service-attendance-rate">{attendanceRate}% attendance</span>
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
          <button className="btn-outline" onClick={() => onTakeAttendance(service)}>
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
  const navigate = useNavigate()
  const [services, setServices]               = useState([])
  const [loading, setLoading]                 = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeService, setActiveService]     = useState(null)
  const [successMsg, setSuccessMsg]           = useState('')

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

  // Called by Service Mode when the usher finishes a service.
  const handleAttendanceSaved = (message) => {
    setSuccessMsg(message)
    fetchServices()
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  // Called when Service Mode closes — refresh the list so counts are current.
  const handleCloseServiceMode = () => {
    setActiveService(null)
    fetchServices()
  }

  const handleAddMember = (query) => {
    setActiveService(null)
    navigate('/members', { state: { prefill: query } })
  }

  const totalServices = services.length
  const avgAttendance = services.filter(s => s.attendanceTaken).length > 0
    ? Math.round(
        services
          .filter(s => s.attendanceTaken)
          .reduce((sum, s) => sum + (s.totalPresent / Math.max(s.totalExpected, 1)) * 100, 0)
        / services.filter(s => s.attendanceTaken).length
      )
    : 0

  return (
    <div className="attendance-page">

      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            {totalServices} service{totalServices !== 1 ? 's' : ''} recorded
            {avgAttendance > 0 && ` · ${avgAttendance}% average attendance`}
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} /> New Service
        </button>
      </div>

      <div className="attendance-stats-row">
        {[
          { label: 'Total Services',      value: totalServices,                                   icon: Calendar, color: 'var(--primary)' },
          { label: 'Avg Attendance Rate', value: `${avgAttendance}%`,                             icon: Users,    color: 'var(--success)' },
          { label: 'Pending Attendance',  value: services.filter(s => !s.attendanceTaken).length, icon: XCircle,  color: 'var(--warning)' },
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
            action={{ label: '+ New Service', onClick: () => setShowCreateModal(true) }}
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

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}
        title="Create New Service" size="md">
        <CreateServiceForm api={api} onSuccess={handleServiceCreated}
          onClose={() => setShowCreateModal(false)} />
      </Modal>

      {/* Full-screen Service Mode replaces the old cramped modal */}
      {activeService && (
        <ServiceMode
          service={activeService}
          api={api}
          onClose={handleCloseServiceMode}
          onFinished={handleAttendanceSaved}
          onAddMember={handleAddMember}
        />
      )}
    </div>
  )
}