import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, CheckCircle, Edit2, Trash2,
  ChevronLeft, ChevronRight, Calendar,
  List, UserCheck, RefreshCw
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── CONSTANTS ────────────────────────────────
const EVENT_TYPE_LABELS = {
  sunday_service:     'Sunday Service',
  midweek_service:    'Midweek Service',
  prayer_meeting:     'Prayer Meeting',
  vigil:              'Vigil',
  conference:         'Conference',
  revival:            'Revival / Crusade',
  outreach:           'Outreach / Evangelism',
  department_meeting: 'Department Meeting',
  cell_group_meeting: 'Cell Group Meeting',
  wedding:            'Wedding',
  funeral:            'Funeral',
  dedication:         'Child Dedication',
  youth_program:      'Youth Program',
  womens_fellowship:  "Women's Fellowship",
  mens_fellowship:    "Men's Fellowship",
  harvest:            'Annual Harvest',
  homecoming:         'Homecoming',
  guest_minister:     'Guest Minister',
  other:              'Other',
}

const EVENT_TYPE_COLORS = {
  sunday_service:     '#4F46E5',
  midweek_service:    '#0891B2',
  prayer_meeting:     '#7C3AED',
  vigil:              '#1E40AF',
  conference:         '#D97706',
  revival:            '#DC2626',
  outreach:           '#059669',
  department_meeting: '#DB2777',
  cell_group_meeting: '#0F766E',
  wedding:            '#EC4899',
  funeral:            '#64748B',
  dedication:         '#F59E0B',
  youth_program:      '#10B981',
  womens_fellowship:  '#E11D48',
  mens_fellowship:    '#1D4ED8',
  harvest:            '#92400E',
  homecoming:         '#7C3AED',
  guest_minister:     '#B45309',
  other:              '#94A3B8',
}

const STATUS_STYLES = {
  upcoming:  { bg: '#DBEAFE', color: '#1E40AF' },
  ongoing:   { bg: '#D1FAE5', color: '#065F46' },
  completed: { bg: '#F1F5F9', color: '#475569' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B' },
}

const PRIORITY_STYLES = {
  normal:    null,
  important: { bg: '#FEF3C7', color: '#92400E', label: '⭐ Important' },
  major:     { bg: '#FEE2E2', color: '#991B1B', label: '🔴 Major Program' },
}

// ─── ATTENDANCE STATUS CONFIG ─────────────────
const STATUS_CONFIG = {
  present: { label: 'Present', color: '#059669', bg: '#D1FAE5' },
  absent:  { label: 'Absent',  color: '#DC2626', bg: '#FEE2E2' },
  late:    { label: 'Late',    color: '#D97706', bg: '#FEF3C7' },
  excused: { label: 'Excused', color: '#2563EB', bg: '#DBEAFE' },
  visitor: { label: 'Visitor', color: '#7C3AED', bg: '#EDE9FE' },
}
const STATUS_CYCLE = ['absent', 'present', 'late', 'excused', 'visitor']

const formatDate = (date, opts = {}) =>
  new Date(date).toLocaleDateString('en-GH', {
    day: 'numeric', month: 'short', year: 'numeric', ...opts
  })

const isMultiDay = (e) =>
  new Date(e.startDate).toDateString() !== new Date(e.endDate).toDateString()

// ─── EVENT FORM ───────────────────────────────
function EventForm({ api, departments, editing, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    title:              editing?.title              || '',
    eventType:          editing?.eventType          || 'sunday_service',
    description:        editing?.description        || '',
    startDate:          editing ? new Date(editing.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    endDate:            editing ? new Date(editing.endDate).toISOString().split('T')[0]   : new Date().toISOString().split('T')[0],
    startTime:          editing?.startTime          || '',
    endTime:            editing?.endTime            || '',
    location:           editing?.location           || '',
    departmentId:       editing?.departmentId?._id  || editing?.departmentId || '',
    expectedAttendance: editing?.expectedAttendance || '',
    status:             editing?.status             || 'upcoming',
    priority:           editing?.priority           || 'normal',
    color:              editing?.color              || '#4F46E5',
    isRecurring:        editing?.isRecurring        || false,
    recurringPattern:   editing?.recurringPattern   || 'weekly',
    recurringEndDate:   editing?.recurringEndDate
      ? new Date(editing.recurringEndDate).toISOString().split('T')[0] : '',
    notes: editing?.notes || '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleTypeChange = (e) => {
    const type = e.target.value
    setForm(prev => ({ ...prev, eventType: type, color: EVENT_TYPE_COLORS[type] || '#4F46E5' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Event title is required.'); return }
    if (!form.startDate || !form.endDate) { setError('Start and end dates are required.'); return }
    if (new Date(form.endDate) < new Date(form.startDate)) { setError('End date cannot be before start date.'); return }

    setLoading(true)
    try {
      const data = await api(editing ? `/events/${editing._id}` : '/events', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...form,
          departmentId: form.departmentId || null,
          expectedAttendance: form.expectedAttendance ? parseInt(form.expectedAttendance) : 0
        })
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
        <p className="form-section-title">Event Details</p>
        <div className="form-group">
          <label className="form-label">Event Title *</label>
          <input name="title" value={form.title} onChange={handleChange}
            className="form-input" placeholder="e.g. Sunday Morning Service" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Event Type *</label>
            <select name="eventType" value={form.eventType} onChange={handleTypeChange} className="form-input">
              {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Event Color</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input name="color" type="color" value={form.color} onChange={handleChange}
                style={{ width: 48, height: 38, borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)', cursor: 'pointer', padding: 2 }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Auto-set by type</span>
            </div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input name="description" value={form.description} onChange={handleChange}
            className="form-input" placeholder="Brief description of the event" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Date & Time</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date *</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">End Date *</label>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input name="startTime" type="time" value={form.startTime} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input name="endTime" type="time" value={form.endTime} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location / Venue</label>
          <input name="location" value={form.location} onChange={handleChange}
            className="form-input" placeholder="e.g. Main Auditorium, Room 3" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Organisation</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department (optional)</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="form-input">
              <option value="">No department (church-wide)</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Expected Attendance</label>
            <input name="expectedAttendance" type="number" min="0" value={form.expectedAttendance}
              onChange={handleChange} className="form-input" placeholder="0" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="form-input">
              <option value="normal">Normal</option>
              <option value="important">⭐ Important</option>
              <option value="major">🔴 Major Program</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="form-input">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Recurring</p>
        <div className="form-group form-group-checkbox">
          <label className="checkbox-label">
            <input name="isRecurring" type="checkbox" checked={form.isRecurring} onChange={handleChange} />
            <span>This is a recurring event</span>
          </label>
        </div>
        {form.isRecurring && (
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Repeat Pattern</label>
              <select name="recurringPattern" value={form.recurringPattern} onChange={handleChange} className="form-input">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Repeat Until</label>
              <input name="recurringEndDate" type="date" value={form.recurringEndDate}
                onChange={handleChange} className="form-input" />
            </div>
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <input name="notes" value={form.notes} onChange={handleChange}
          className="form-input" placeholder="Any additional notes" />
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Event')}
        </button>
      </div>
    </form>
  )
}

// ─── ATTENDANCE MODAL ─────────────────────────
function AttendanceModal({ event, api, onClose, onSaved }) {
  const [session, setSession]         = useState(null)
  const [members, setMembers]         = useState([])
  const [departments, setDepartments] = useState([])
  const [records, setRecords]         = useState({})
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [search, setSearch]           = useState('')
  const [deptFilter, setDeptFilter]   = useState('all')
  const [successMsg, setSuccessMsg]   = useState('')

  useEffect(() => {
    const init = async () => {
      try {
        const headers = {
          'Content-Type': 'application/json'
        }

        const [sessionRes, membersRes, deptsRes] = await Promise.all([
          api('/sessions', {
            method: 'POST', headers,
            body: JSON.stringify({ eventId: event._id })
          }),
          api('/members?limit=500', { headers }),
          api('/departments', { headers }),
        ])

        const sessionData = sessionRes.ok  ? sessionRes  : null
        const membersData = membersRes.ok  ? membersRes  : null
        const deptsData   = deptsRes.ok    ? deptsRes    : null

        if (sessionData?.success) setSession(sessionData.session)
        if (deptsData?.success)   setDepartments(deptsData.departments)

        if (membersData?.success) {
          setMembers(membersData.members)

          // Start everyone as absent
          const recordMap = {}
          membersData.members.forEach(m => { recordMap[m._id] = 'absent' })

          // Overlay existing saved records
          sessionData?.records?.forEach(r => {
            const id = r.memberId?._id || r.memberId
            if (id) recordMap[id] = r.status
          })

          setRecords(recordMap)
        }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    init()
  }, [event._id, api])

  // Click cycles through statuses
  const toggleStatus = (memberId) => {
    setRecords(prev => {
      const current = prev[memberId] || 'absent'
      const next    = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
      return { ...prev, [memberId]: next }
    })
  }

  // Bulk mark filtered members
  const markAll = (status) => {
    const updated = {}
    filtered.forEach(m => { updated[m._id] = status })
    setRecords(prev => ({ ...prev, ...updated }))
  }

  const handleSave = async () => {
    if (!session) return
    setSaving(true)
    try {
      const attendance = Object.entries(records).map(([memberId, status]) => ({ memberId, status }))
      const data = await api(`/sessions/${session._id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance })
      })
      if (data.success) {
        setSession(data.session)
        setSuccessMsg('Attendance saved!')
        setTimeout(() => { onSaved(); onClose() }, 1200)
      }
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const filtered = members.filter(m => {
    const matchSearch = `${m.firstName} ${m.lastName} ${m.memberId || ''}`
      .toLowerCase().includes(search.toLowerCase())
    const matchDept = deptFilter === 'all' ||
      (m.departmentId?._id || m.departmentId || '') === deptFilter
    return matchSearch && matchDept
  })

  const summary = {
    present: Object.values(records).filter(s => s === 'present').length,
    absent:  Object.values(records).filter(s => s === 'absent').length,
    late:    Object.values(records).filter(s => s === 'late').length,
    excused: Object.values(records).filter(s => s === 'excused').length,
    visitor: Object.values(records).filter(s => s === 'visitor').length,
  }

  if (loading) return <LoadingSpinner message="Loading attendance..." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      {successMsg && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--success-bg)', borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)', color: 'var(--success-text)', fontWeight: 600
        }}>
          ✓ {successMsg}
        </div>
      )}

      {/* Summary Bar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.entries(summary).map(([status, count]) => {
          const cfg = STATUS_CONFIG[status]
          return (
            <div key={status} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              background: cfg.bg, border: `1px solid ${cfg.color}33`
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)', fontWeight: 800, color: cfg.color }}>{count}</span>
            </div>
          )
        })}
        <span style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {members.length} members total
        </span>
      </div>

      {/* Bulk Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Bulk:</span>
        {[
          { label: 'All Present', status: 'present', color: '#059669' },
          { label: 'All Absent',  status: 'absent',  color: '#DC2626' },
          { label: 'All Late',    status: 'late',    color: '#D97706' },
        ].map(({ label, status, color }) => (
          <button key={status} onClick={() => markAll(status)} style={{
            padding: '4px 12px', borderRadius: 'var(--radius-full)',
            border: `1.5px solid ${color}`, background: 'none',
            color, fontSize: 11, fontWeight: 700, cursor: 'pointer'
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" placeholder="Search member by name or ID..."
          style={{ flex: 1 }} />
        {departments.length > 0 && (
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="filter-select">
            <option value="all">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        )}
      </div>

      {/* Members List */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
        overflow: 'hidden', maxHeight: 360, overflowY: 'auto'
      }}>
        {filtered.length === 0 ? (
          <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
            No members found.
          </p>
        ) : filtered.map((m, i) => {
          const status = records[m._id] || 'absent'
          const cfg    = STATUS_CONFIG[status]
          return (
            <div key={m._id} onClick={() => toggleStatus(m._id)} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
              cursor: 'pointer', transition: 'background var(--transition-fast)',
              background: status !== 'absent' ? cfg.bg + '50' : 'transparent'
            }}>
              <div className="member-avatar" style={{
                width: 34, height: 34, fontSize: 12, flexShrink: 0,
                background: cfg.bg, color: cfg.color
              }}>
                {m.firstName[0]}{m.lastName[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                  {m.firstName} {m.lastName}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.memberId}</p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 10px',
                borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', flexShrink: 0,
                background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`
              }}>
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Save Bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)',
        flexWrap: 'wrap', gap: 'var(--space-3)'
      }}>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {summary.present + summary.late} present/late · {summary.absent} absent
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CALENDAR VIEW ────────────────────────────
function CalendarView({ events, currentDate, onEventClick }) {
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth     = new Date(year, month + 1, 0).getDate()
  const startOffset     = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const getEventsForDay = (day) => {
    if (!day) return []
    const cellStart = new Date(year, month, day)
    const cellEnd   = new Date(year, month, day, 23, 59, 59)
    return events.filter(e => {
      const s  = new Date(e.startDate)
      const en = new Date(e.endDate)
      return s <= cellEnd && en >= cellStart
    })
  }

  return (
    <div className="calendar-wrap">
      <div className="calendar-grid-header">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {cells.map((day, i) => {
          const dayEvents = getEventsForDay(day)
          const isToday   = day &&
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year
          const isPast = day &&
            new Date(year, month, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate())

          return (
            <div key={i} className={`calendar-cell ${!day ? 'calendar-cell-empty' : ''} ${isToday ? 'calendar-cell-today' : ''} ${isPast && day ? 'calendar-cell-past' : ''}`}>
              {day && (
                <>
                  <span className="calendar-day-num">{day}</span>
                  <div className="calendar-day-events">
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div key={j} className="calendar-event-pill"
                        style={{ background: e.color || '#4F46E5' }}
                        onClick={() => onEventClick(e)}
                        title={e.title}>
                        {e.startTime ? `${e.startTime} ` : ''}{e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="calendar-more-pill">+{dayEvents.length - 3} more</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── EVENT CARD ───────────────────────────────
function EventCard({ event, onEdit, onDelete, onTakeAttendance }) {
  const typeColor    = EVENT_TYPE_COLORS[event.eventType] || '#4F46E5'
  const typeLabel    = EVENT_TYPE_LABELS[event.eventType]  || event.eventType
  const statusStyle  = STATUS_STYLES[event.status]         || STATUS_STYLES.upcoming
  const priorityInfo = PRIORITY_STYLES[event.priority]
  const multiDay     = isMultiDay(event)
  const isFutureEvent = new Date(event.startDate) > new Date();

  return (
    <div className="event-card">
      <div className="event-card-stripe" style={{ background: event.color || typeColor }} />
      <div className="event-card-body">

        {/* Title row */}
        <div className="event-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <p className="event-card-title">{event.title}</p>
            {priorityInfo && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: priorityInfo.bg, color: priorityInfo.color }}>
                {priorityInfo.label}
              </span>
            )}
            {event.isRecurring && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                <RefreshCw size={9} style={{ display: 'inline', marginRight: 2 }} />Recurring
              </span>
            )}
            {/* Attendance taken badge */}
            {event.actualAttendance > 0 && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: '#D1FAE5', color: '#065F46' }}>
                ✓ {event.actualAttendance} attended
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 'var(--space-1)', flexShrink: 0 }}>
            <button className="dept-edit-btn"
              style={{ color: 'var(--success)', opacity: isFutureEvent ? 0.35 : 1, cursor: isFutureEvent ? 'not-allowed' : 'pointer' }}
              onClick={(e) => { e.stopPropagation(); if (!isFutureEvent) onTakeAttendance(event) }}
              disabled={isFutureEvent}
              title={isFutureEvent ? 'Cannot take attendance for a future service' : 'Take Attendance'}>
              <UserCheck size={14} />
            </button>
            <button className="dept-edit-btn"
              onClick={(e) => { e.stopPropagation(); onEdit(event) }}
              title="Edit">
              <Edit2 size={14} />
            </button>
            <button className="dept-edit-btn"
              style={{ color: 'var(--danger)' }}
              onClick={(e) => { e.stopPropagation(); onDelete(event) }}
              title="Delete">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Type + Status badges */}
        <div className="event-card-meta">
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: typeColor + '18', color: typeColor }}>
            {typeLabel}
          </span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.color }}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>

        {/* Meta info */}
        <div className="event-card-info">
          <span>📅 {formatDate(event.startDate)}{multiDay && ` → ${formatDate(event.endDate)}`}</span>
          {event.startTime && <span>🕐 {event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>}
          {event.location   && <span>📍 {event.location}</span>}
          {event.departmentId && <span>🏢 {event.departmentId.name}</span>}
          {event.expectedAttendance > 0 && <span>👥 {event.expectedAttendance} expected</span>}
        </div>

        {event.description && (
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)', lineHeight: 1.5 }}>
            {event.description}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── BIRTHDAY SECTION ─────────────────────────
function BirthdaySection({ api }) {
  const [birthdays, setBirthdays] = useState([])
  const [loading, setLoading]     = useState(true)
  const now = new Date()

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`/events/birthdays?month=${now.getMonth() + 1}`,
          {}
        )
        if (data.success) setBirthdays(data.birthdays)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [api])

  const todayBdays    = birthdays.filter(b => b.isToday)
  const upcomingBdays = birthdays.filter(b => !b.isToday)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
    }}>
      <div style={{
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <p style={{ fontWeight: 'var(--weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
          🎂 Birthdays This Month
        </p>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {now.toLocaleDateString('en-GH', { month: 'long' })}
        </span>
      </div>

      {loading ? <LoadingSpinner /> : birthdays.length === 0 ? (
        <p style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
          No birthdays this month.
        </p>
      ) : (
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {todayBdays.length > 0 && (
            <div style={{ background: '#FEF3C7', borderBottom: '1px solid var(--border)', padding: 'var(--space-3) var(--space-4)' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-2)' }}>
                🎉 Today
              </p>
              {todayBdays.map(b => (
                <div key={b._id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                  <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 11, background: '#FDE68A', color: '#B45309' }}>
                    {b.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{b.phone}</p>
                  </div>
                  <span style={{ fontSize: 20 }}>🎂</span>
                </div>
              ))}
            </div>
          )}
          {upcomingBdays.map(b => (
            <div key={b._id} style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
              padding: 'var(--space-3) var(--space-4)',
              borderBottom: '1px solid var(--border)'
            }}>
              <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
                {b.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{b.phone}</p>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>
                {new Date(b.dateOfBirth).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────
export default function Events() {
  const { api, branchReady } = useApi()
  const [view, setView]                   = useState('list')
  const [events, setEvents]               = useState([])
  const [departments, setDepartments]     = useState([])
  const [loading, setLoading]             = useState(true)
  const [currentDate, setCurrentDate]     = useState(new Date())
  const [showModal, setShowModal]         = useState(false)
  const [editingEvent, setEditingEvent]   = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [attendanceEvent, setAttendanceEvent] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting]           = useState(false)
  const [successMsg, setSuccessMsg]       = useState('')
  const [statusFilter, setStatusFilter]   = useState('')
  const [typeFilter, setTypeFilter]       = useState('')

  const fetchEvents = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const headers = { }
      const params  = new URLSearchParams()
      if (view === 'calendar') {
        params.append('month', currentDate.getMonth())
        params.append('year',  currentDate.getFullYear())
      }
      if (statusFilter) params.append('status',    statusFilter)
      if (typeFilter)   params.append('eventType', typeFilter)

      const [evRes, deptRes] = await Promise.all([
        api(`/events?${params}`, { headers }),
        api('/departments',       { headers }),
      ])
      const [evData, deptData] = await Promise.all([evRes, deptRes])
      if (evData.success)   setEvents(evData.events)
      if (deptData.success) setDepartments(deptData.departments)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady, view, currentDate, statusFilter, typeFilter])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchEvents() }, [fetchEvents])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api(`/events/${confirmDelete._id}`, {
        method: 'DELETE', 
      })
      setConfirmDelete(null)
      fetchEvents()
      showSuccess('Event deleted.')
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing')
  const pastEvents     = events.filter(e => e.status === 'completed' || e.status === 'cancelled')

  return (
    <div className="events-page">

      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Events & Programs</h1>
          <p className="page-subtitle">Church program coordination centre</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div className="events-view-toggle">
            <button className={`events-toggle-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <List size={14} /> List
            </button>
            <button className={`events-toggle-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
              <Calendar size={14} /> Calendar
            </button>
          </div>
          <button className="btn-primary" onClick={() => { setEditingEvent(null); setShowModal(true) }}>
            <Plus size={16} /> New Event
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="events-stats-row">
        {[
          { label: 'Total Events', value: events.length,                                     color: 'var(--primary)'   },
          { label: 'Upcoming',     value: events.filter(e => e.status === 'upcoming').length, color: 'var(--info)'      },
          { label: 'Ongoing',      value: events.filter(e => e.status === 'ongoing').length,  color: 'var(--success)'   },
          { label: 'Completed',    value: events.filter(e => e.status === 'completed').length, color: 'var(--text-muted)'},
        ].map(({ label, value, color }) => (
          <div key={label} className="dept-stat-card">
            <div>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', color, lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ padding: 'var(--space-3) var(--space-4)' }}>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
          <option value="">All Types</option>
          {Object.entries(EVENT_TYPE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* ══ CALENDAR VIEW ══ */}
      {view === 'calendar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="calendar-nav">
            <button className="page-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
              <ChevronLeft size={16} />
            </button>
            <h3 className="calendar-month-title">
              {currentDate.toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="page-btn"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
              <ChevronRight size={16} />
            </button>
          </div>
          {loading ? <LoadingSpinner /> : (
            <CalendarView events={events} currentDate={currentDate} onEventClick={setSelectedEvent} />
          )}
          <BirthdaySection api={api} />
        </div>
      )}

      {/* ══ LIST VIEW ══ */}
      {view === 'list' && (
            <div className="events-list-grid">
          <div>
            {loading ? <LoadingSpinner /> : events.length === 0 ? (
              <EmptyState icon={Calendar} title="No events yet"
                message="Create your first church event or program."
                action={{ label: '+ New Event', onClick: () => setShowModal(true) }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {upcomingEvents.length > 0 && (
                  <div>
                    <p className="form-section-title" style={{ marginBottom: 'var(--space-3)' }}>
                      Upcoming & Ongoing
                    </p>
                    <div className="event-list">
                      {upcomingEvents.map(e => (
                        <EventCard key={e._id} event={e}
                          onEdit={ev => { setEditingEvent(ev); setShowModal(true) }}
                          onDelete={ev => setConfirmDelete(ev)}
                          onTakeAttendance={ev => setAttendanceEvent(ev)} />
                      ))}
                    </div>
                  </div>
                )}
                {pastEvents.length > 0 && (
                  <div>
                    <p className="form-section-title" style={{ marginBottom: 'var(--space-3)', color: 'var(--text-muted)' }}>
                      Past Events
                    </p>
                    <div className="event-list" style={{ opacity: 0.75 }}>
                      {pastEvents.map(e => (
                        <EventCard key={e._id} event={e}
                          onEdit={ev => { setEditingEvent(ev); setShowModal(true) }}
                          onDelete={ev => setConfirmDelete(ev)}
                          onTakeAttendance={ev => setAttendanceEvent(ev)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <BirthdaySection api={api} />
        </div>
      )}

      {/* Event Detail Modal (from calendar) */}
      <Modal open={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details" size="md">
        {selectedEvent && (
          <div className="member-form">
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
              <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: selectedEvent.color || '#4F46E5', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                  {selectedEvent.title}
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, background: (selectedEvent.color || '#4F46E5') + '18', color: selectedEvent.color || '#4F46E5' }}>
                    {EVENT_TYPE_LABELS[selectedEvent.eventType]}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999, ...STATUS_STYLES[selectedEvent.status] }}>
                    {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                  </span>
                </div>
                <div className="profile-preview-details">
                  {[
                    ['Start', formatDate(selectedEvent.startDate, { weekday: 'long' })],
                    isMultiDay(selectedEvent) ? ['End', formatDate(selectedEvent.endDate, { weekday: 'long' })] : null,
                    selectedEvent.startTime ? ['Time', `${selectedEvent.startTime}${selectedEvent.endTime ? ` – ${selectedEvent.endTime}` : ''}`] : null,
                    selectedEvent.location  ? ['Location',   selectedEvent.location]          : null,
                    selectedEvent.departmentId ? ['Department', selectedEvent.departmentId.name] : null,
                    selectedEvent.expectedAttendance ? ['Expected', `${selectedEvent.expectedAttendance} people`] : null,
                    selectedEvent.actualAttendance   ? ['Attended', `${selectedEvent.actualAttendance} people`]  : null,
                    selectedEvent.description ? ['Description', selectedEvent.description] : null,
                    selectedEvent.notes       ? ['Notes',       selectedEvent.notes]       : null,
                  ].filter(Boolean).map(([label, value]) => (
                    <div key={label} className="profile-detail-row">
                      <span className="profile-detail-label">{label}</span>
                      <span className="profile-detail-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-outline" onClick={() => setSelectedEvent(null)}>Close</button>
              <button className="btn-primary"
                style={{ background: 'var(--success)', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}
                onClick={() => { setAttendanceEvent(selectedEvent); setSelectedEvent(null) }}>
                <UserCheck size={14} /> Take Attendance
              </button>
              <button className="btn-primary"
                onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null); setShowModal(true) }}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create / Edit Modal */}
      <Modal open={showModal} onClose={() => { setShowModal(false); setEditingEvent(null) }}
        title={editingEvent ? 'Edit Event' : 'New Event'} size="lg">
        <EventForm api={api} departments={departments} editing={editingEvent}
          onSuccess={() => {
            setShowModal(false); setEditingEvent(null)
            fetchEvents()
            showSuccess(editingEvent ? 'Event updated.' : 'Event created.')
          }}
          onClose={() => { setShowModal(false); setEditingEvent(null) }} />
      </Modal>

      {/* Take Attendance Modal */}
      <Modal
        open={!!attendanceEvent}
        onClose={() => setAttendanceEvent(null)}
        title={attendanceEvent ? `Attendance — ${attendanceEvent.title}` : ''}
        size="lg">
        {attendanceEvent && (
          <AttendanceModal
            event={attendanceEvent}
            api={api}
            onClose={() => setAttendanceEvent(null)}
            onSaved={() => { fetchEvents(); setAttendanceEvent(null) }}
          />
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Event?"
        message={confirmDelete ? `Delete "${confirmDelete.title}"? This cannot be undone.` : ''}
        confirmLabel="Delete Event"
      />
    </div>
  )
}