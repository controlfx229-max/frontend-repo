import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Zap, ToggleLeft, ToggleRight, Play,
  Clock, CheckCircle, AlertCircle,
  Edit2, X, ChevronDown, ChevronUp,
  Send, Users, Calendar, Gift,
  Bell, UserPlus, AlertTriangle
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// ─── AUTOMATION TYPE CONFIG ──────────────────
const TYPE_CONFIG = {
  birthday_wish: {
    icon:  Gift,
    color: '#EC4899',
    bg:    '#FCE7F3',
    label: 'Birthday Wishes',
    freq:  'Runs daily at 8:00 AM',
  },
  inactive_followup: {
    icon:  Users,
    color: '#D97706',
    bg:    '#FEF3C7',
    label: 'Inactive Follow-up',
    freq:  'Runs daily at 8:00 AM',
  },
  welcome_message: {
    icon:  UserPlus,
    color: '#059669',
    bg:    '#D1FAE5',
    label: 'Welcome Message',
    freq:  'Fires instantly on new member add',
  },
  attendance_alert: {
    icon:  Bell,
    color: '#7C3AED',
    bg:    '#EDE9FE',
    label: 'Absence Alert',
    freq:  'Runs daily at 8:00 AM',
  },
  event_reminder: {
    icon:  Calendar,
    color: '#0891B2',
    bg:    '#E0F2FE',
    label: 'Event Reminder',
    freq:  'Runs daily at 8:00 AM',
  },
}

// ─── TIME AGO ─────────────────────────────────
const timeAgo = (date) => {
  if (!date) return 'Never'
  const diff = Math.floor((new Date() - new Date(date)) / 1000)
  if (diff < 60)    return 'Just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── EDIT AUTOMATION MODAL ───────────────────
function EditModal({ automation, api, onSuccess, onClose }) {
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState('')
  const [messageBody, setBody] = useState(automation.messageBody || '')
  const [config, setConfig]    = useState(automation.config || {})

  const handleSave = async () => {
    if (!messageBody.trim()) { setError('Message body is required.'); return }
    setLoading(true)
    try {
      const data = await api(`/automations/${automation._id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messageBody, config })
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.automation)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  const cfg  = TYPE_CONFIG[automation.type] || {}
  const Icon = cfg.icon || Zap

  return (
    <div className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        background: cfg.bg, borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-2)'
      }}>
        <Icon size={16} color={cfg.color} />
        <div>
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: cfg.color }}>{cfg.label}</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{cfg.freq}</p>
        </div>
      </div>

      <div className="form-section">
        {automation.type === 'inactive_followup' && (
          <div className="form-group">
            <label className="form-label">Trigger After (weeks of absence)</label>
            <select value={config.inactiveWeeks || 4}
              onChange={e => setConfig(p => ({ ...p, inactiveWeeks: parseInt(e.target.value) }))}
              className="form-input">
              {[1,2,3,4,6,8,12].map(w => (
                <option key={w} value={w}>{w} week{w > 1 ? 's' : ''}</option>
              ))}
            </select>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4 }}>
              Members absent longer than this will receive the message.
            </p>
          </div>
        )}

        {automation.type === 'attendance_alert' && (
          <div className="form-group">
            <label className="form-label">Consecutive Absences to Trigger</label>
            <select value={config.consecutiveAbsences || 3}
              onChange={e => setConfig(p => ({ ...p, consecutiveAbsences: parseInt(e.target.value) }))}
              className="form-input">
              {[2,3,4,5,6].map(n => (
                <option key={n} value={n}>{n} services in a row</option>
              ))}
            </select>
          </div>
        )}

        {automation.type === 'event_reminder' && (
          <div className="form-group">
            <label className="form-label">Send Reminder How Many Days Before Event?</label>
            <select value={config.daysBeforeEvent || 1}
              onChange={e => setConfig(p => ({ ...p, daysBeforeEvent: parseInt(e.target.value) }))}
              className="form-input">
              {[1,2,3,5,7].map(d => (
                <option key={d} value={d}>{d} day{d > 1 ? 's' : ''} before</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Message Body *</label>
          <textarea value={messageBody} onChange={e => setBody(e.target.value)}
            className="form-input" rows={5} style={{ resize: 'vertical', fontFamily: 'inherit' }} />
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
            Variables: <code>{'{{firstName}}'}</code> · <code>{'{{fullName}}'}</code> · <code>{'{{churchName}}'}</code>
            {automation.type === 'event_reminder' && (
              <> · <code>{'{{eventName}}'}</code> · <code>{'{{eventDate}}'}</code></>
            )}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {messageBody.length}/160 characters
            {messageBody.length > 160 && (
              <span style={{ color: 'var(--warning)', fontWeight: 700 }}> (will split into 2 SMS)</span>
            )}
          </p>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── LOG DRAWER ───────────────────────────────
function LogDrawer({ automation, api, open, onClose }) {
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await api(`/automations/${automation._id}/logs`)
        if (data.success) setLogs(data.automation.logs || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [open, automation._id, api])

  if (!open) return null

  return (
    <Modal open={open} onClose={onClose} title={`Run History — ${automation.name}`} size="md">
      {loading ? <LoadingSpinner message="Loading logs..." /> : logs.length === 0 ? (
        <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)' }}>No runs yet. Toggle it on or trigger it manually.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)', gap: 'var(--space-4)'
            }}>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {log.note || 'Ran successfully'}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{timeAgo(log.firedAt)}</p>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--success)' }}>✓ {log.totalSent} sent</span>
                {log.totalFailed > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)' }}>✗ {log.totalFailed} failed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  )
}

// ─── AUTOMATION CARD ──────────────────────────
function AutomationCard({ automation, api, onUpdate }) {
  const [toggling,   setToggling]   = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [showEdit,   setShowEdit]   = useState(false)
  const [showLogs,   setShowLogs]   = useState(false)
  const [runResult,  setRunResult]  = useState(null)
  const [expanded,   setExpanded]   = useState(false)

  const cfg  = TYPE_CONFIG[automation.type] || {}
  const Icon = cfg.icon || Zap
  const isActive = automation.isActive

  const handleToggle = async () => {
    setToggling(true)
    try {
      const data = await api(`/automations/${automation._id}/toggle`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isActive: !isActive })
      })
      if (data.success) onUpdate(data.automation)
    } catch {}
    finally { setToggling(false) }
  }

  const handleRun = async () => {
    setTriggering(true)
    setRunResult(null)
    try {
      const data = await api(`/automations/${automation._id}/run`, { method: 'POST' })
      if (data.success) {
        setRunResult(data.result)
        onUpdate({ ...automation, lastRunAt: new Date(), totalSent: automation.totalSent + data.result.sent })
        setTimeout(() => setRunResult(null), 6000)
      }
    } catch {}
    finally { setTriggering(false) }
  }

  return (
    <>
      <div className={`auto-card ${isActive ? 'auto-card--active' : 'auto-card--inactive'}`}>

        {/* ── INACTIVE BANNER ── shown only when off */}
        {!isActive && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#FFFBEB',
            borderBottom: '1px solid #FDE68A',
          }}>
            <AlertTriangle size={13} color="#D97706" strokeWidth={2.5} />
            <p style={{
              fontSize: 11,
              fontWeight: 600,
              color: '#92400E',
              margin: 0,
              flex: 1,
            }}>
              This automation is <strong>off</strong> — toggle the switch to activate it and begin sending messages automatically.
            </p>
            <button
              onClick={handleToggle}
              disabled={toggling}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                background: '#D97706',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                opacity: toggling ? 0.7 : 1,
              }}
            >
              {toggling ? '...' : 'Activate'}
            </button>
          </div>
        )}

        {/* Card Header */}
        <div className="auto-card-header" style={{ opacity: isActive ? 1 : 0.65 }}>
          <div className="auto-card-left">
            <div className="auto-card-icon" style={{ background: isActive ? cfg.bg : '#F1F5F9' }}>
              <Icon size={20} color={isActive ? cfg.color : '#94A3B8'} />
            </div>
            <div>
              <p className="auto-card-name" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {automation.name}
              </p>
              <p className="auto-card-desc">{automation.description}</p>
            </div>
          </div>

          <button
            className="auto-toggle-btn"
            onClick={handleToggle}
            disabled={toggling}
            title={isActive ? 'Turn off' : 'Turn on'}
          >
            {isActive
              ? <ToggleRight size={32} color="var(--success)" />
              : <ToggleLeft  size={32} color="#CBD5E1" />
            }
          </button>
        </div>

        {/* Run result banner */}
        {runResult && (
          <div style={{
            margin: '0 var(--space-5) var(--space-3)',
            padding: 'var(--space-3) var(--space-4)',
            background: runResult.sent > 0 ? 'var(--success-bg)' : 'var(--surface-2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)', fontWeight: 600,
            color: runResult.sent > 0 ? 'var(--success-text)' : 'var(--text-secondary)'
          }}>
            <CheckCircle size={14} />
            {runResult.note} — {runResult.sent} sent
            {runResult.failed > 0 && `, ${runResult.failed} failed`}
          </div>
        )}

        {/* Stats Row */}
        <div className="auto-card-stats" style={{ opacity: isActive ? 1 : 0.55 }}>
          <div className="auto-stat">
            <Clock size={12} color="var(--text-muted)" />
            <span>Last run: {timeAgo(automation.lastRunAt)}</span>
          </div>
          <div className="auto-stat">
            <Send size={12} color="var(--text-muted)" />
            <span>{automation.totalSent} messages sent total</span>
          </div>
          {/* Status pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '2px 10px',
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            background: isActive ? '#DCFCE7' : '#F1F5F9',
            color:      isActive ? '#166534' : '#64748B',
            border: `1px solid ${isActive ? '#BBF7D0' : '#E2E8F0'}`,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: isActive ? '#22C55E' : '#94A3B8',
              display: 'inline-block',
            }} />
            {isActive ? 'Active' : 'Inactive'}
          </div>
        </div>

        {/* Expand — message preview */}
        <button className="auto-expand-btn" onClick={() => setExpanded(e => !e)}>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? 'Hide message' : 'Preview message'}
        </button>

        {expanded && (
          <div className="auto-message-preview">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {automation.messageBody}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="auto-card-actions">
          <button className="btn-outline auto-action-btn" onClick={() => setShowEdit(true)}>
            <Edit2 size={13} /> Edit
          </button>
          <button className="btn-outline auto-action-btn" onClick={() => setShowLogs(true)}>
            <Clock size={13} /> History
          </button>
          {isActive ? (
            <button className="btn-primary auto-action-btn" onClick={handleRun} disabled={triggering}>
              <Play size={13} />
              {triggering ? 'Running...' : 'Run Now'}
            </button>
          ) : (
            /* Replace Run Now with Activate when inactive */
            <button
              className="auto-action-btn"
              onClick={handleToggle}
              disabled={toggling}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px',
                background: 'transparent',
                border: '1.5px dashed #CBD5E1',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)',
                fontWeight: 600,
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <ToggleRight size={13} />
              {toggling ? 'Activating...' : 'Activate to run'}
            </button>
          )}
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Automation" size="md">
        <EditModal automation={automation} api={api}
          onSuccess={(updated) => { onUpdate(updated); setShowEdit(false) }}
          onClose={() => setShowEdit(false)} />
      </Modal>

      <LogDrawer automation={automation} api={api} open={showLogs} onClose={() => setShowLogs(false)} />
    </>
  )
}

// ─── MAIN AUTOMATIONS PAGE ────────────────────
export default function Automations() {
  const { api, branchReady } = useApi()
  const [automations, setAutomations] = useState([])
  const [loading, setLoading]         = useState(true)

  const fetchAutomations = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const data = await api('/automations')
      if (data.success) setAutomations(data.automations)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady])

  useEffect(() => { fetchAutomations() }, [fetchAutomations])

  const handleUpdate = (updated) => {
    setAutomations(prev => prev.map(a => a._id === updated._id ? updated : a))
  }

  const activeCount   = automations.filter(a => a.isActive).length
  const inactiveCount = automations.filter(a => !a.isActive).length
  const totalSent     = automations.reduce((sum, a) => sum + (a.totalSent || 0), 0)

  return (
    <div className="automations-page">

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Automations</h1>
          <p className="page-subtitle">
            {activeCount} of {automations.length} automations active
            {totalSent > 0 && ` · ${totalSent} messages sent automatically`}
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="auto-info-banner">
        <Zap size={16} color="var(--primary)" />
        <p>
          Automations run <strong>daily at 8:00 AM</strong>. Welcome messages fire
          instantly when a new member is added. You can also trigger any automation
          manually using the <strong>Run Now</strong> button.
        </p>
      </div>

      {/* ── INACTIVE WARNING — shown when any are off ── */}
      {inactiveCount > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          padding: '12px 16px',
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 'var(--radius-lg)',
          marginBottom: 'var(--space-5)',
        }}>
          <AlertTriangle size={16} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 'var(--text-sm)', color: '#78350F', margin: 0, lineHeight: 1.5 }}>
            <strong>{inactiveCount} automation{inactiveCount > 1 ? 's are' : ' is'} currently off</strong> and will not send any messages until activated.
            Toggle the switch on each card to enable them.
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="auto-stats-row">
        {[
          { label: 'Active Automations',  value: activeCount,         color: 'var(--success)' },
          { label: 'Total Messages Sent', value: totalSent,           color: 'var(--primary)' },
          { label: 'Total Automations',   value: automations.length,  color: 'var(--info)'    },
        ].map(({ label, value, color }) => (
          <div className="auto-stat-card" key={label}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color, lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Automation Cards */}
      {loading ? (
        <LoadingSpinner message="Loading automations..." />
      ) : (
        <div className="auto-cards-grid">
          {automations.map(auto => (
            <AutomationCard key={auto._id} automation={auto} api={api} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}