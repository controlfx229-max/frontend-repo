import { useState, useEffect, useCallback, useRef } from 'react'
import useApi from '../../hooks/useApi'
import {
  Send, Clock, FileText, Users, CheckCircle,
  MessageSquare, Plus, Edit2, Trash2,
  ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── CONSTANTS ────────────────────────────────
const AUDIENCE_OPTIONS = [
  { id: 'all',        label: 'All Members',      emoji: '👥' },
  { id: 'department', label: 'By Department',    emoji: '🏢' },
  { id: 'cell_group', label: 'By Cell Group',    emoji: '👫' },
  { id: 'status',     label: 'By Status',        emoji: '🏷️' },
  { id: 'birthday',   label: 'Birthday Today',   emoji: '🎂' },
  { id: 'inactive',   label: 'Inactive Members', emoji: '⚠️' },
]

const MEMBER_STATUSES = [
  { value: 'active',      label: 'Active'      },
  { value: 'new_convert', label: 'New Convert' },
  { value: 'visitor',     label: 'Visitor'     },
  { value: 'inactive',    label: 'Inactive'    },
  { value: 'transferred', label: 'Transferred' },
]

const TEMPLATE_CATEGORIES = {
  birthday:       { label: 'Birthday',       color: '#EC4899' },
  event_reminder: { label: 'Event Reminder', color: '#4F46E5' },
  follow_up:      { label: 'Follow-up',      color: '#D97706' },
  offering:       { label: 'Offering',       color: '#059669' },
  welcome:        { label: 'Welcome',        color: '#0891B2' },
  custom:         { label: 'Custom',         color: '#64748B' },
}

const MESSAGE_STATUS_STYLES = {
  draft:     { bg: '#F1F5F9', color: '#64748B', label: 'Draft'     },
  scheduled: { bg: '#FEF3C7', color: '#92400E', label: 'Scheduled' },
  sending:   { bg: '#DBEAFE', color: '#1E40AF', label: 'Sending'   },
  sent:      { bg: '#D1FAE5', color: '#065F46', label: 'Sent'      },
  failed:    { bg: '#FEE2E2', color: '#991B1B', label: 'Failed'    },
}

const timeAgo = (date) => {
  const s = Math.floor((new Date() - new Date(date)) / 1000)
  if (s < 60)  return 'Just now'
  const m = Math.floor(s / 60)
  if (m < 60)  return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h}h ago`
  return new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' })
}

const SMS_LIMIT = 160

// ─── TEMPLATE FORM ────────────────────────────
function TemplateForm({ api, editing, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:     editing?.name     || '',
    category: editing?.category || 'custom',
    type:     editing?.type     || 'sms',
    body:     editing?.body     || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.body.trim()) { setError('Name and body are required.'); return }
    setLoading(true)
    try {
      const data = await api(
        editing ? `/communications/templates/${editing._id}` : '/communications/templates',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) }
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
        <div className="form-group">
          <label className="form-label">Template Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={form.category}
              onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {Object.keys(TEMPLATE_CATEGORIES).map(k => (
                <option key={k} value={k}>{TEMPLATE_CATEGORIES[k].label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input" value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
              <option value="sms">SMS</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Message Body *</label>
          <textarea className="form-input" rows={5} value={form.body}
            onChange={e => setForm(p => ({ ...p, body: e.target.value }))} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : editing ? 'Update Template' : 'Create Template'}
        </button>
      </div>
    </form>
  )
}

// ─── COMPOSE TAB ──────────────────────────────
function ComposeTab({ api, branchReady }) {
  const [departments, setDepartments] = useState([])
  const [cellGroups, setCellGroups]   = useState([])
  const [templates, setTemplates]     = useState([])
  const [preview, setPreview]         = useState(null)   // { count, names[] }
  const [previewLoading, setPreviewLoading] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')
  const [form, setForm] = useState({
    type:         'sms',
    body:         '',
    audienceType: 'all',
    departmentId: '',
    cellGroupId:  '',
    memberStatus: '',
  })

  // Debounce ref so preview doesn't fire on every keystroke
  const previewTimer = useRef(null)

  useEffect(() => {
    if (!branchReady) return
    Promise.all([
      api('/departments'),
      api('/departments/cellgroups'),
      api('/communications/templates'),
    ]).then(([d, g, t]) => {
      if (d.success) setDepartments(d.departments)
      if (g.success) setCellGroups(g.cellGroups)
      if (t.success) setTemplates(t.templates)
    }).catch(console.error)
  }, [api, branchReady])

  // Build audience object from current form state
  const buildAudience = (f = form) => ({
    type:         f.audienceType,
    departmentId: f.audienceType === 'department' ? f.departmentId || undefined : undefined,
    cellGroupId:  f.audienceType === 'cell_group' ? f.cellGroupId  || undefined : undefined,
    memberStatus: f.audienceType === 'status'     ? f.memberStatus || undefined : undefined,
  })

  // Auto-refresh preview whenever audience selection changes
  const refreshPreview = useCallback(async (f) => {
    const audience = buildAudience(f)
    // Don't preview if a sub-selection is still missing
    if (f.audienceType === 'department' && !f.departmentId) { setPreview(null); return }
    if (f.audienceType === 'cell_group' && !f.cellGroupId)  { setPreview(null); return }
    setPreviewLoading(true)
    try {
      const data = await api('/communications/preview-audience', {
        method: 'POST',
        body: JSON.stringify({ audience })
      })
      if (data.success) setPreview(data)
    } catch {}
    finally { setPreviewLoading(false) }
  }, [api]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFormChange = (field, value) => {
    const next = { ...form, [field]: value }
    // Reset sub-selections when audience type changes
    if (field === 'audienceType') {
      next.departmentId = ''
      next.cellGroupId  = ''
      next.memberStatus = ''
    }
    setForm(next)
    setPreview(null)
    clearTimeout(previewTimer.current)
    previewTimer.current = setTimeout(() => refreshPreview(next), 400)
  }

  const handleSend = async () => {
    if (!form.body.trim()) { setError('Message body is required.'); return }
    setLoading(true)
    setError('')
    try {
      const data = await api('/communications/send', {
        method: 'POST',
        body: JSON.stringify({ type: form.type, body: form.body, audience: buildAudience() })
      })
      if (!data.success) { setError(data.message); return }
      setSuccess(data.message || 'Message sent successfully.')
      setForm(f => ({ ...f, body: '' }))
      setPreview(null)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  const recipientLabel = previewLoading
    ? 'Calculating recipients…'
    : preview != null
      ? `${preview.count} recipient${preview.count === 1 ? '' : 's'} will receive this message`
      : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {error   && <div className="form-error"><AlertCircle size={14} /> {error}</div>}
      {success && <div className="success-toast"><CheckCircle size={16} /> {success}</div>}

      {/* Audience */}
      <div className="form-section">
        <p className="form-section-title">Audience</p>

        <div className="form-group">
          <label className="form-label">Send to</label>
          <select className="form-input" value={form.audienceType}
            onChange={e => handleFormChange('audienceType', e.target.value)}>
            {AUDIENCE_OPTIONS.map(o => (
              <option key={o.id} value={o.id}>{o.emoji} {o.label}</option>
            ))}
          </select>
        </div>

        {form.audienceType === 'department' && (
          <div className="form-group">
            <label className="form-label">Department</label>
            <select className="form-input" value={form.departmentId}
              onChange={e => handleFormChange('departmentId', e.target.value)}>
              <option value="">— Select department —</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        )}

        {form.audienceType === 'cell_group' && (
          <div className="form-group">
            <label className="form-label">Cell Group</label>
            <select className="form-input" value={form.cellGroupId}
              onChange={e => handleFormChange('cellGroupId', e.target.value)}>
              <option value="">— Select cell group —</option>
              {cellGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
        )}

        {form.audienceType === 'status' && (
          <div className="form-group">
            <label className="form-label">Member Status</label>
            <select className="form-input" value={form.memberStatus}
              onChange={e => handleFormChange('memberStatus', e.target.value)}>
              <option value="">— Select status —</option>
              {MEMBER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        )}

        {/* Recipient count badge */}
        {recipientLabel && (
          <div style={{
            marginTop: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)',
            background: preview?.count > 0 ? '#DBEAFE' : '#FEF3C7',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)', fontWeight: 600,
            color: preview?.count > 0 ? '#1E40AF' : '#92400E',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)'
          }}>
            <Users size={14} /> {recipientLabel}
          </div>
        )}
      </div>

      {/* Message */}
      <div className="form-section">
        <p className="form-section-title">Message</p>

        <div className="form-row" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="form-group">
            <label className="form-label">Message Type</label>
            <select className="form-input" value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="sms">SMS</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>
          {templates.length > 0 && (
            <div className="form-group">
              <label className="form-label">Use Template</label>
              <select className="form-input" defaultValue=""
                onChange={e => {
                  const t = templates.find(x => x._id === e.target.value)
                  if (t) setForm(f => ({ ...f, body: t.body }))
                }}>
                <option value="">— Select template —</option>
                {templates.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="form-group">
          <textarea className="form-input" rows={6} value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder={`Type your message here. Use {{firstName}} for personalisation.`} />
          <p style={{ fontSize: 11, color: form.body.length > SMS_LIMIT ? 'var(--danger)' : 'var(--text-muted)', marginTop: 4 }}>
            {form.body.length} / {SMS_LIMIT} chars {form.type === 'sms' && form.body.length > SMS_LIMIT ? '— will split into multiple SMS' : ''}
          </p>
        </div>
      </div>

      <button className="btn-primary" onClick={handleSend}
        disabled={loading || !form.body.trim() || (preview != null && preview.count === 0)}>
        <Send size={16} /> {loading ? 'Sending…' : `Send${preview?.count ? ` to ${preview.count} member${preview.count > 1 ? 's' : ''}` : ''}`}
      </button>
    </div>
  )
}

// ─── HISTORY TAB ──────────────────────────────
function HistoryTab({ api, branchReady }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [expanded, setExpanded]   = useState(null)

  const fetchMessages = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.append('type', typeFilter)
      const data = await api(`/communications?${params}`)
      if (data.success) setMessages(data.messages)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady, typeFilter])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  if (loading) return <LoadingSpinner message="Loading history…" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="filter-select">
        <option value="">All Types</option>
        <option value="sms">SMS</option>
        <option value="announcement">Announcement</option>
      </select>

      {messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages sent yet"
          message="Send your first message from the Compose tab." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {messages.map(msg => {
            const ss = MESSAGE_STATUS_STYLES[msg.status] || MESSAGE_STATUS_STYLES.draft
            const isOpen = expanded === msg._id
            return (
              <div key={msg._id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-4)', cursor: 'pointer' }}
                  onClick={() => setExpanded(isOpen ? null : msg._id)}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: ss.bg, color: ss.color }}>
                      {ss.label}
                    </span>
                    <p style={{ marginTop: 8, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {msg.body.slice(0, 80)}{msg.body.length > 80 ? '…' : ''}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      👥 {msg.totalRecipients} · {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                {isOpen && (
                  <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', whiteSpace: 'pre-wrap' }}>{msg.body}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── TEMPLATES TAB ────────────────────────────
function TemplatesTab({ api, branchReady }) {
  const [templates, setTemplates]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [confirmDelete, setConfirm] = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [successMsg, setSuccess]    = useState('')

  const fetchTemplates = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const data = await api('/communications/templates')
      if (data.success) setTemplates(data.templates)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api(`/communications/templates/${confirmDelete._id}`, { method: 'DELETE' })
      setConfirm(null)
      fetchTemplates()
      setSuccess('Template deleted.')
      setTimeout(() => setSuccess(''), 3000)
    } catch {}
    finally { setDeleting(false) }
  }

  if (loading) return <LoadingSpinner message="Loading templates…" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {successMsg && (
        <div className="success-toast"><CheckCircle size={16} /> {successMsg}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={16} /> New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <EmptyState icon={FileText} title="No templates yet"
          message="Create reusable message templates." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {templates.map(t => {
            const cat = TEMPLATE_CATEGORIES[t.category] || TEMPLATE_CATEGORIES.custom
            return (
              <div key={t._id} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: cat.color + '18', color: cat.color, display: 'inline-block', marginBottom: 6 }}>
                      {cat.label}
                    </span>
                    <p style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {t.name}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <button className="dept-edit-btn" onClick={() => { setEditing(t); setShowModal(true) }} title="Edit">
                      <Edit2 size={13} />
                    </button>
                    <button className="dept-edit-btn" style={{ color: 'var(--danger)' }}
                      onClick={() => setConfirm(t)} title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {t.body.slice(0, 120)}{t.body.length > 120 ? '…' : ''}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); setEditing(null) }}
        title={editing ? 'Edit Template' : 'New Template'} size="md">
        <TemplateForm api={api} editing={editing}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchTemplates(); setSuccess('Template saved.') }}
          onClose={() => { setShowModal(false); setEditing(null) }} />
      </Modal>

      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirm(null)}
        onConfirm={handleDelete} loading={deleting}
        title="Delete Template?"
        message={confirmDelete ? `Delete "${confirmDelete.name}"?` : ''}
        confirmLabel="Delete" />
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────
export default function Communications() {
  const { api, branchReady } = useApi()
  const [activeTab, setActiveTab] = useState('compose')

  const TABS = [
    { id: 'compose',   label: 'Compose',   icon: Send      },
    { id: 'history',   label: 'History',   icon: Clock     },
    { id: 'templates', label: 'Templates', icon: FileText  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Communications</h1>
          <p className="page-subtitle">Send SMS, announcements and messages to your members</p>
        </div>
      </div>

      <div className="settings-tabs">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <tab.icon size={16} /><span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'compose'   && <ComposeTab   api={api} branchReady={branchReady} />}
      {activeTab === 'history'   && <HistoryTab   api={api} branchReady={branchReady} />}
      {activeTab === 'templates' && <TemplatesTab api={api} branchReady={branchReady} />}
    </div>
  )
}