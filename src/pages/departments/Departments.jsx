import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Edit2, Trash2, Users, UserCheck, UserPlus,
  ChevronDown, ChevronRight, CheckCircle, Layers,
  Crown, Phone, Hash, Search, X, UserMinus
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

/* ─────────────────────────────────────────────
   SCOPED STYLES
───────────────────────────────────────────── */
const styles = `
.dcp-page {
  padding: var(--space-6);
  max-width: 900px;
  margin: 0 auto;
}

/* ── PAGE HEADER ── */
.dcp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  gap: var(--space-4);
  flex-wrap: wrap;
}
.dcp-header-text h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}
.dcp-header-text p {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin: 0;
}
.dcp-header-actions {
  display: flex;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* ── SECTION TITLES ── */
.dcp-section-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}
.dcp-section-label-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}
.dcp-section-label-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ── DEPARTMENT CARD ── */
.dept-v2-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.dept-v2-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.dept-v2-stripe {
  height: 4px;
  width: 100%;
}
.dept-v2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  user-select: none;
  gap: var(--space-3);
}
.dept-v2-header:hover {
  background: var(--surface-2);
}
.dept-v2-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.dept-v2-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dept-v2-name {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dept-v2-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 2px 0 0;
}
.dept-v2-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}
.dept-v2-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: var(--text-xs);
  color: var(--text-secondary);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 3px 10px;
  white-space: nowrap;
}
.dept-v2-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.dept-v2-icon-btn:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
.dept-v2-icon-btn.danger:hover {
  background: rgba(239,68,68,0.08);
  color: var(--danger);
}

/* ── DEPT BODY (expanded) ── */
.dept-v2-body {
  border-top: 1px solid var(--border);
  padding: var(--space-4) var(--space-5) var(--space-5);
}

/* Leader row */
.dept-v2-leader-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-4);
}
.dept-v2-leader-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-right: var(--space-1);
}
.dept-v2-leader-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}
.dept-v2-no-leader {
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-style: italic;
}
.dept-v2-set-leader-btn {
  margin-left: auto;
  font-size: var(--text-xs);
  padding: 4px 12px;
}

/* Members list */
.dept-v2-members-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}
.dept-v2-members-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-secondary);
}
.dept-v2-member-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  transition: background 0.1s;
}
.dept-v2-member-row:hover {
  background: var(--surface-2);
}
.dept-v2-member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-light, #EEF2FF);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.dept-v2-member-avatar.leader-avatar {
  background: #FEF3C7;
  color: #D97706;
}
.dept-v2-member-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}
.dept-v2-member-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 0;
}
.dept-v2-leader-crown {
  margin-left: var(--space-1);
  color: #D97706;
}
.dept-v2-empty-members {
  text-align: center;
  padding: var(--space-6) var(--space-4);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

/* ── CELL GROUP CARD ── */
.cg-v2-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow 0.15s;
}
.cg-v2-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.cg-v2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  user-select: none;
  gap: var(--space-3);
}
.cg-v2-header:hover {
  background: var(--surface-2);
}
.cg-v2-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.cg-v2-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--surface-2);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cg-v2-name {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}
.cg-v2-meta {
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin: 2px 0 0;
}
.cg-v2-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}
.cg-v2-body {
  border-top: 1px solid var(--border);
  padding: var(--space-4) var(--space-5) var(--space-5);
}

/* ── ASSIGN MODAL LIST ── */
.assign-list {
  max-height: 340px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-top: var(--space-3);
}
.assign-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border);
  transition: background 0.1s;
}
.assign-row:last-child { border-bottom: none; }
.assign-row:hover { background: var(--surface-2); }
.assign-search {
  position: relative;
  margin-bottom: var(--space-3);
}
.assign-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}
.assign-search input {
  padding-left: 36px !important;
}

/* ── SUCCESS TOAST ── */
.dcp-toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  background: var(--success);
  color: #fff;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  animation: slideUp 0.2s ease;
}
@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── STACKS ── */
.dcp-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* remove-btn danger inline */
.btn-danger-ghost {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--text-xs);
  padding: 4px 10px;
  border: 1px solid var(--danger);
  color: var(--danger);
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.1s;
}
.btn-danger-ghost:hover {
  background: rgba(239,68,68,0.07);
}
`

/* ─────────────────────────────────────────────
   AVATAR HELPER
───────────────────────────────────────────── */
function Avatar({ member, size = 32, isLeader = false, style = {} }) {
  const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`
  return (
    <div
      className={`dept-v2-member-avatar${isLeader ? ' leader-avatar' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38, ...style }}
    >
      {initials}
    </div>
  )
}

/* ─────────────────────────────────────────────
   DEPARTMENT FORM
───────────────────────────────────────────── */
function DepartmentForm({ api, editing, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:        editing?.name        || '',
    description: editing?.description || '',
    color:       editing?.color       || '#4F46E5',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Department name is required.'); return }
    setLoading(true)
    try {
      const data = await api(
        editing ? `/departments/${editing._id}` : '/departments',
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
          <label className="form-label">Department Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Colour</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <input type="color" value={form.color}
              onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
              style={{ width: 44, height: 40, padding: 2, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'none' }} />
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{form.color}</span>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : editing ? 'Update Department' : 'Create Department'}
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────
   SET DEPARTMENT LEADER MODAL
───────────────────────────────────────────── */
function SetDeptLeaderModal({ dept, members, api, onSuccess, onClose }) {
  const [leaderId, setLeaderId] = useState(dept.leaderId?._id || dept.leaderId || '')
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      await api(`/departments/${dept._id}`, {
        method: 'PUT', body: JSON.stringify({ leaderId: leaderId || null })
      })
      onSuccess()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="member-form">
      <div className="form-section">
        <div className="assign-search">
          <Search size={14} className="assign-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" placeholder="Search member…" />
        </div>
        <div className="assign-list">
          {/* Clear leader option */}
          <div className="assign-row" onClick={() => setLeaderId('')} style={{ cursor: 'pointer' }}>
            <div className="dept-v2-member-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>—</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>No leader</p>
            </div>
            {!leaderId && <CheckCircle size={15} color="var(--success)" />}
          </div>
          {filtered.map(m => (
            <div key={m._id} className="assign-row" onClick={() => setLeaderId(m._id)} style={{ cursor: 'pointer' }}>
              <Avatar member={m} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.firstName} {m.lastName}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.phone}</p>
              </div>
              {leaderId === m._id && <CheckCircle size={15} color="var(--success)" />}
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Set Leader'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ASSIGN MEMBERS TO DEPARTMENT MODAL
───────────────────────────────────────────── */
function AssignDeptMembersModal({ dept, api, onSuccess, onClose }) {
  const [members, setMembers]     = useState([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [busy, setBusy]           = useState(null)

  useEffect(() => {
    api('/members?limit=300')
      .then(d => { if (d.success) setMembers(d.members) })
      .finally(() => setLoading(false))
  }, [api])

  const toggle = async (m) => {
    const inDept = String(m.departmentId?._id || m.departmentId || '') === String(dept._id)
    setBusy(m._id)
    try {
      const data = await api(`/members/${m._id}`, {
        method: 'PUT',
        body: JSON.stringify({ departmentId: inDept ? null : dept._id })
      })
      if (data.success) {
        setMembers(prev => prev.map(x =>
          x._id === m._id
            ? { ...x, departmentId: inDept ? null : { _id: dept._id, name: dept.name, color: dept.color } }
            : x
        ))
      }
    } catch {}
    finally { setBusy(null) }
  }

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="member-form">
      <div className="form-section">
        <div className="assign-search">
          <Search size={14} className="assign-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" placeholder="Search by name or phone…" />
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="assign-list">
            {filtered.length === 0
              ? <p style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>No members found</p>
              : filtered.map(m => {
                  const deptId  = m.departmentId?._id || m.departmentId
                  const inThis  = deptId && String(deptId) === String(dept._id)
                  const inOther = !inThis && !!deptId

                  return (
                    <div key={m._id} className="assign-row">
                      <Avatar member={m} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.firstName} {m.lastName}</p>
                        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {m.phone}
                          {inOther && <span style={{ color: 'var(--warning, #D97706)' }}> · In: {m.departmentId?.name}</span>}
                        </p>
                      </div>
                      {inThis ? (
                        <button className="btn-danger-ghost" onClick={() => toggle(m)} disabled={busy === m._id}>
                          <UserMinus size={12} /> {busy === m._id ? '…' : 'Remove'}
                        </button>
                      ) : (
                        <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                          onClick={() => toggle(m)} disabled={busy === m._id}>
                          {busy === m._id ? '…' : 'Add'}
                        </button>
                      )}
                    </div>
                  )
                })
            }
          </div>
        )}
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={() => { onSuccess(); onClose() }}>Done</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DEPARTMENT CARD
───────────────────────────────────────────── */
function DepartmentCard({ dept, deptMembers, api, onEdit, onDelete, onSetLeader, onManageMembers }) {
  const [expanded, setExpanded] = useState(false)

  const leader = dept.leaderId
    ? (deptMembers.find(m => String(m._id) === String(dept.leaderId?._id || dept.leaderId)) || dept.leaderId)
    : null
  const leaderId = dept.leaderId?._id || dept.leaderId

  return (
    <div className="dept-v2-card">
      <div className="dept-v2-stripe" style={{ background: dept.color }} />

      {/* Header row */}
      <div className="dept-v2-header" onClick={() => setExpanded(x => !x)}>
        <div className="dept-v2-left">
          <div className="dept-v2-dot" style={{ background: dept.color }} />
          <div style={{ minWidth: 0 }}>
            <p className="dept-v2-name">{dept.name}</p>
            {dept.description && <p className="dept-v2-desc">{dept.description}</p>}
          </div>
        </div>
        <div className="dept-v2-right">
          <span className="dept-v2-badge"><Users size={12} />{dept.memberCount || 0} members</span>
          <button className="dept-v2-icon-btn" title="Edit department"
            onClick={e => { e.stopPropagation(); onEdit(dept) }}>
            <Edit2 size={14} />
          </button>
          <button className="dept-v2-icon-btn danger" title="Delete department"
            onClick={e => { e.stopPropagation(); onDelete(dept) }}>
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronDown size={16} color="var(--text-muted)" />
            : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div className="dept-v2-body">

          {/* Leader row */}
          <div className="dept-v2-leader-row">
            <Crown size={14} color="#D97706" />
            <span className="dept-v2-leader-label">Leader</span>
            {leader ? (
              <>
                <Avatar member={typeof leader === 'object' ? leader : { firstName: '?', lastName: '' }} size={26} isLeader />
                <span className="dept-v2-leader-name">
                  {typeof leader === 'object' ? `${leader.firstName} ${leader.lastName}` : 'Set'}
                </span>
              </>
            ) : (
              <span className="dept-v2-no-leader">No leader assigned</span>
            )}
            <button className="btn-secondary dept-v2-set-leader-btn"
              onClick={e => { e.stopPropagation(); onSetLeader(dept) }}>
              {leader ? 'Change' : 'Set Leader'}
            </button>
          </div>

          {/* Members list */}
          <div className="dept-v2-members-header">
            <span className="dept-v2-members-title">Members ({deptMembers.length})</span>
            <button className="btn-secondary" style={{ fontSize: 'var(--text-xs)', padding: '5px 12px' }}
              onClick={e => { e.stopPropagation(); onManageMembers(dept) }}>
              <UserPlus size={13} /> Manage Members
            </button>
          </div>

          {deptMembers.length === 0 ? (
            <div className="dept-v2-empty-members">
              No members in this department yet.
              <br />
              <button className="btn-ghost" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)' }}
                onClick={e => { e.stopPropagation(); onManageMembers(dept) }}>
                + Add Members
              </button>
            </div>
          ) : (
            <div>
              {deptMembers.map(m => {
                const isLeader = leaderId && String(m._id) === String(leaderId)
                return (
                  <div key={m._id} className="dept-v2-member-row">
                    <Avatar member={m} size={32} isLeader={isLeader} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="dept-v2-member-name">
                        {m.firstName} {m.lastName}
                        {isLeader && (
                          <Crown size={12} className="dept-v2-leader-crown" style={{ display: 'inline', marginLeft: 6 }} />
                        )}
                      </p>
                      <p className="dept-v2-member-meta">{m.phone}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   CELL GROUP FORM
───────────────────────────────────────────── */
function CellGroupForm({ api, editing, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:            editing?.name            || '',
    description:     editing?.description     || '',
    meetingDay:      editing?.meetingDay      || '',
    meetingTime:     editing?.meetingTime     || '',
    meetingLocation: editing?.meetingLocation || '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Cell group name is required.'); return }
    setLoading(true)
    try {
      const payload = { ...form, departmentId: null } // always general
      const data = await api(
        editing ? `/departments/cellgroups/${editing._id}` : '/departments/cellgroups',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }
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
          <label className="form-label">Cell Group Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={2} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Meeting Day</label>
            <select className="form-input" value={form.meetingDay}
              onChange={e => setForm(p => ({ ...p, meetingDay: e.target.value }))}>
              <option value="">Select day</option>
              {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(d =>
                <option key={d} value={d.toLowerCase()}>{d}</option>
              )}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Meeting Time</label>
            <input type="time" className="form-input" value={form.meetingTime}
              onChange={e => setForm(p => ({ ...p, meetingTime: e.target.value }))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={form.meetingLocation}
            onChange={e => setForm(p => ({ ...p, meetingLocation: e.target.value }))} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : editing ? 'Update Cell Group' : 'Create Cell Group'}
        </button>
      </div>
    </form>
  )
}

/* ─────────────────────────────────────────────
   SET CELL GROUP LEADER
───────────────────────────────────────────── */
function SetCGLeaderModal({ group, members, api, onSuccess, onClose }) {
  const [leaderId, setLeaderId] = useState(group.leaderId?._id || group.leaderId || '')
  const [loading, setLoading]   = useState(false)
  const [search, setSearch]     = useState('')

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSave = async () => {
    setLoading(true)
    try {
      await api(`/departments/cellgroups/${group._id}`, {
        method: 'PUT', body: JSON.stringify({ leaderId: leaderId || null })
      })
      onSuccess()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="member-form">
      <div className="form-section">
        <div className="assign-search">
          <Search size={14} className="assign-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" placeholder="Search member…" />
        </div>
        <div className="assign-list">
          <div className="assign-row" onClick={() => setLeaderId('')} style={{ cursor: 'pointer' }}>
            <div className="dept-v2-member-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--surface-2)', color: 'var(--text-muted)' }}>—</div>
            <div style={{ flex: 1 }}><p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>No leader</p></div>
            {!leaderId && <CheckCircle size={15} color="var(--success)" />}
          </div>
          {filtered.map(m => (
            <div key={m._id} className="assign-row" onClick={() => setLeaderId(m._id)} style={{ cursor: 'pointer' }}>
              <Avatar member={m} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.firstName} {m.lastName}</p>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.phone}</p>
              </div>
              {leaderId === m._id && <CheckCircle size={15} color="var(--success)" />}
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving…' : 'Set Leader'}
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   ASSIGN MEMBERS TO CELL GROUP MODAL
───────────────────────────────────────────── */
function AssignCGMembersModal({ group, api, onSuccess, onClose }) {
  const [members, setMembers]   = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState(null)
  const [assigned, setAssigned] = useState([])

  useEffect(() => {
    api('/members?limit=300')
      .then(d => { if (d.success) setMembers(d.members) })
      .finally(() => setLoading(false))
  }, [api])

  const handleAssign = async (memberId) => {
    setBusy(memberId)
    try {
      const data = await api(`/members/${memberId}`, {
        method: 'PUT', body: JSON.stringify({ cellGroupId: group._id })
      })
      if (data.success) setAssigned(p => [...p, memberId])
    } catch {}
    finally { setBusy(null) }
  }

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone || ''}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="member-form">
      <div className="form-section">
        <div className="assign-search">
          <Search size={14} className="assign-search-icon" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="form-input" placeholder="Search by name or phone…" />
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="assign-list">
            {filtered.length === 0
              ? <p style={{ padding: 'var(--space-5)', textAlign: 'center', color: 'var(--text-muted)', margin: 0 }}>No members found</p>
              : filtered.map(m => {
                  const inGroup = assigned.includes(m._id) ||
                    String(m.cellGroupId?._id || m.cellGroupId || '') === String(group._id)
                  return (
                    <div key={m._id} className="assign-row">
                      <Avatar member={m} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.firstName} {m.lastName}</p>
                        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.phone}</p>
                      </div>
                      {inGroup
                        ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 700 }}>✓ Assigned</span>
                        : <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                            onClick={() => handleAssign(m._id)} disabled={busy === m._id}>
                            {busy === m._id ? '…' : 'Add'}
                          </button>
                      }
                    </div>
                  )
                })
            }
          </div>
        )}
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={() => { onSuccess(); onClose() }}>Done</button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CELL GROUP CARD
───────────────────────────────────────────── */
function CellGroupCard({ group, api, allMembers, onEdit, onDelete, onSetLeader, onAssignMember }) {
  const [expanded, setExpanded] = useState(false)

  const leaderId  = group.leaderId?._id || group.leaderId
  const leaderObj = group.leaderId && typeof group.leaderId === 'object' ? group.leaderId : null

  // members in this group
  const groupMembers = allMembers.filter(m =>
    String(m.cellGroupId?._id || m.cellGroupId || '') === String(group._id)
  )

  const days = { sunday:'Sun', monday:'Mon', tuesday:'Tue', wednesday:'Wed',
                  thursday:'Thu', friday:'Fri', saturday:'Sat' }

  const metaParts = [
    group.meetingDay ? days[group.meetingDay] || group.meetingDay : null,
    group.meetingTime || null,
    group.meetingLocation || null,
  ].filter(Boolean)

  return (
    <div className="cg-v2-card">
      <div className="cg-v2-header" onClick={() => setExpanded(x => !x)}>
        <div className="cg-v2-left">
          <div className="cg-v2-icon">
            <Layers size={16} color="var(--text-muted)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="cg-v2-name">{group.name}</p>
            {metaParts.length > 0 && (
              <p className="cg-v2-meta">{metaParts.join(' · ')}</p>
            )}
          </div>
        </div>
        <div className="cg-v2-right">
          <span className="dept-v2-badge"><Users size={12} />{groupMembers.length}</span>
          <button className="dept-v2-icon-btn" title="Assign members"
            onClick={e => { e.stopPropagation(); onAssignMember(group) }}>
            <UserPlus size={14} />
          </button>
          <button className="dept-v2-icon-btn" title="Set leader"
            onClick={e => { e.stopPropagation(); onSetLeader(group) }}>
            <Crown size={14} />
          </button>
          <button className="dept-v2-icon-btn" title="Edit"
            onClick={e => { e.stopPropagation(); onEdit(group) }}>
            <Edit2 size={14} />
          </button>
          <button className="dept-v2-icon-btn danger" title="Delete"
            onClick={e => { e.stopPropagation(); onDelete(group) }}>
            <Trash2 size={14} />
          </button>
          {expanded
            ? <ChevronDown size={16} color="var(--text-muted)" />
            : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {expanded && (
        <div className="cg-v2-body">
          {/* Leader */}
          <div className="dept-v2-leader-row" style={{ marginBottom: 'var(--space-4)' }}>
            <Crown size={14} color="#D97706" />
            <span className="dept-v2-leader-label">Leader</span>
            {leaderObj ? (
              <>
                <Avatar member={leaderObj} size={26} isLeader />
                <span className="dept-v2-leader-name">{leaderObj.firstName} {leaderObj.lastName}</span>
              </>
            ) : (
              <span className="dept-v2-no-leader">No leader assigned</span>
            )}
            <button className="btn-secondary dept-v2-set-leader-btn"
              onClick={e => { e.stopPropagation(); onSetLeader(group) }}>
              {leaderObj ? 'Change' : 'Set Leader'}
            </button>
          </div>

          {/* Members */}
          <div className="dept-v2-members-header">
            <span className="dept-v2-members-title">Members ({groupMembers.length})</span>
            <button className="btn-secondary" style={{ fontSize: 'var(--text-xs)', padding: '5px 12px' }}
              onClick={e => { e.stopPropagation(); onAssignMember(group) }}>
              <UserPlus size={13} /> Manage
            </button>
          </div>

          {groupMembers.length === 0 ? (
            <div className="dept-v2-empty-members">
              No members in this cell group yet.
            </div>
          ) : (
            groupMembers.map(m => {
              const isLeader = leaderId && String(m._id) === String(leaderId)
              return (
                <div key={m._id} className="dept-v2-member-row">
                  <Avatar member={m} size={32} isLeader={isLeader} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="dept-v2-member-name">
                      {m.firstName} {m.lastName}
                      {isLeader && <Crown size={12} style={{ display: 'inline', marginLeft: 6, color: '#D97706' }} />}
                    </p>
                    <p className="dept-v2-member-meta">{m.phone}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   SECTION DIVIDER
───────────────────────────────────────────── */
function SectionLabel({ icon: Icon, label }) {
  return (
    <div className="dcp-section-label">
      <div className="dcp-section-label-line" />
      <span className="dcp-section-label-text" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={12} />} {label}
      </span>
      <div className="dcp-section-label-line" />
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Departments() {
  const { api, branchReady } = useApi()

  const [departments, setDepartments] = useState([])
  const [cellGroups, setCellGroups]   = useState([])
  const [allMembers, setAllMembers]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [successMsg, setSuccessMsg]   = useState('')

  // Department modals
  const [deptModal, setDeptModal]             = useState(false)
  const [editingDept, setEditingDept]         = useState(null)
  const [deptLeaderModal, setDeptLeaderModal] = useState(false)
  const [deptLeaderTarget, setDeptLeaderTarget] = useState(null)
  const [deptMembersModal, setDeptMembersModal] = useState(false)
  const [deptMembersTarget, setDeptMembersTarget] = useState(null)
  const [confirmDeleteDept, setConfirmDeleteDept] = useState(null)

  // Cell group modals
  const [cgModal, setCgModal]           = useState(false)
  const [editingCG, setEditingCG]       = useState(null)
  const [cgLeaderModal, setCgLeaderModal] = useState(false)
  const [cgLeaderTarget, setCgLeaderTarget] = useState(null)
  const [cgMembersModal, setCgMembersModal] = useState(false)
  const [cgMembersTarget, setCgMembersTarget] = useState(null)
  const [confirmDeleteCG, setConfirmDeleteCG] = useState(null)

  const [deleting, setDeleting] = useState(false)

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const fetchData = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const [dRes, gRes, mRes] = await Promise.all([
        api('/departments'),
        api('/departments/cellgroups'),
        api('/members?limit=300'),
      ])
      if (dRes.success) setDepartments(dRes.departments)
      if (gRes.success) setCellGroups(gRes.cellGroups)
      if (mRes.success) setAllMembers(mRes.members)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady])

  useEffect(() => { fetchData() }, [fetchData])

  // Members per department (derived)
  const membersByDept = useCallback((deptId) =>
    allMembers.filter(m => String(m.departmentId?._id || m.departmentId || '') === String(deptId))
  , [allMembers])

  const handleDeleteDept = async () => {
    setDeleting(true)
    try {
      await api(`/departments/${confirmDeleteDept._id}`, { method: 'DELETE' })
      setConfirmDeleteDept(null)
      fetchData()
      showSuccess('Department deleted.')
    } catch {}
    finally { setDeleting(false) }
  }

  const handleDeleteCG = async () => {
    setDeleting(true)
    try {
      await api(`/departments/cellgroups/${confirmDeleteCG._id}`, { method: 'DELETE' })
      setConfirmDeleteCG(null)
      fetchData()
      showSuccess('Cell group deleted.')
    } catch {}
    finally { setDeleting(false) }
  }

  if (loading) return <LoadingSpinner message="Loading…" />

  return (
    <>
      <style>{styles}</style>
      <div className="dcp-page">

        {successMsg && (
          <div className="dcp-toast"><CheckCircle size={15} /> {successMsg}</div>
        )}

        {/* ── PAGE HEADER ── */}
        <div className="dcp-header">
          <div className="dcp-header-text">
            <h1>Departments &amp; Cell Groups</h1>
            <p>
              {departments.length} department{departments.length !== 1 ? 's' : ''} &nbsp;·&nbsp;
              {cellGroups.length} cell group{cellGroups.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="dcp-header-actions">
            <button className="btn-outline" onClick={() => { setEditingCG(null); setCgModal(true) }}>
              <Plus size={15} /> New Cell Group
            </button>
            <button className="btn-primary" onClick={() => { setEditingDept(null); setDeptModal(true) }}>
              <Plus size={15} /> New Department
            </button>
          </div>
        </div>

        {/* ── DEPARTMENTS SECTION ── */}
        <SectionLabel icon={Users} label="Departments" />

        {departments.length === 0 ? (
          <EmptyState icon={Users}
            title="No departments yet"
            message="Create departments to organise your ministry teams and assign members."
            action={{ label: '+ New Department', onClick: () => { setEditingDept(null); setDeptModal(true) } }} />
        ) : (
          <div className="dcp-stack" style={{ marginBottom: 'var(--space-10)' }}>
            {departments.map(dept => (
              <DepartmentCard
                key={dept._id}
                dept={dept}
                deptMembers={membersByDept(dept._id)}
                api={api}
                onEdit={d => { setEditingDept(d); setDeptModal(true) }}
                onDelete={d => setConfirmDeleteDept(d)}
                onSetLeader={d => { setDeptLeaderTarget(d); setDeptLeaderModal(true) }}
                onManageMembers={d => { setDeptMembersTarget(d); setDeptMembersModal(true) }}
              />
            ))}
          </div>
        )}

        {/* ── CELL GROUPS SECTION ── */}
        <SectionLabel icon={Layers} label="General Cell Groups" />

        {cellGroups.length === 0 ? (
          <EmptyState icon={Layers}
            title="No cell groups yet"
            message="Create cell groups to bring members together in smaller communities."
            action={{ label: '+ New Cell Group', onClick: () => { setEditingCG(null); setCgModal(true) } }} />
        ) : (
          <div className="dcp-stack">
            {cellGroups.map(group => (
              <CellGroupCard
                key={group._id}
                group={group}
                api={api}
                allMembers={allMembers}
                onEdit={g => { setEditingCG(g); setCgModal(true) }}
                onDelete={g => setConfirmDeleteCG(g)}
                onSetLeader={g => { setCgLeaderTarget(g); setCgLeaderModal(true) }}
                onAssignMember={g => { setCgMembersTarget(g); setCgMembersModal(true) }}
              />
            ))}
          </div>
        )}

        {/* ══════ MODALS ══════ */}

        {/* Department form */}
        <Modal open={deptModal} onClose={() => { setDeptModal(false); setEditingDept(null) }}
          title={editingDept ? 'Edit Department' : 'New Department'} size="md">
          <DepartmentForm api={api} editing={editingDept}
            onSuccess={() => { setDeptModal(false); setEditingDept(null); fetchData(); showSuccess('Department saved.') }}
            onClose={() => { setDeptModal(false); setEditingDept(null) }} />
        </Modal>

        {/* Dept set leader */}
        <Modal open={deptLeaderModal} onClose={() => { setDeptLeaderModal(false); setDeptLeaderTarget(null) }}
          title={`Set Leader — ${deptLeaderTarget?.name || ''}`} size="md">
          {deptLeaderTarget && (
            <SetDeptLeaderModal dept={deptLeaderTarget} members={allMembers} api={api}
              onSuccess={() => { setDeptLeaderModal(false); setDeptLeaderTarget(null); fetchData(); showSuccess('Leader updated.') }}
              onClose={() => { setDeptLeaderModal(false); setDeptLeaderTarget(null) }} />
          )}
        </Modal>

        {/* Dept manage members */}
        <Modal open={deptMembersModal} onClose={() => { setDeptMembersModal(false); fetchData() }}
          title={`Members — ${deptMembersTarget?.name || ''}`} size="md">
          {deptMembersTarget && (
            <AssignDeptMembersModal dept={deptMembersTarget} api={api}
              onSuccess={fetchData}
              onClose={() => { setDeptMembersModal(false); fetchData() }} />
          )}
        </Modal>

        {/* Cell group form */}
        <Modal open={cgModal} onClose={() => { setCgModal(false); setEditingCG(null) }}
          title={editingCG ? 'Edit Cell Group' : 'New Cell Group'} size="md">
          <CellGroupForm api={api} editing={editingCG}
            onSuccess={() => { setCgModal(false); setEditingCG(null); fetchData(); showSuccess('Cell group saved.') }}
            onClose={() => { setCgModal(false); setEditingCG(null) }} />
        </Modal>

        {/* CG set leader */}
        <Modal open={cgLeaderModal} onClose={() => { setCgLeaderModal(false); setCgLeaderTarget(null) }}
          title={`Set Leader — ${cgLeaderTarget?.name || ''}`} size="md">
          {cgLeaderTarget && (
            <SetCGLeaderModal group={cgLeaderTarget} members={allMembers} api={api}
              onSuccess={() => { setCgLeaderModal(false); setCgLeaderTarget(null); fetchData(); showSuccess('Leader updated.') }}
              onClose={() => { setCgLeaderModal(false); setCgLeaderTarget(null) }} />
          )}
        </Modal>

        {/* CG assign members */}
        <Modal open={cgMembersModal} onClose={() => { setCgMembersModal(false); fetchData() }}
          title={`Assign Members — ${cgMembersTarget?.name || ''}`} size="md">
          {cgMembersTarget && (
            <AssignCGMembersModal group={cgMembersTarget} api={api}
              onSuccess={fetchData}
              onClose={() => { setCgMembersModal(false); fetchData() }} />
          )}
        </Modal>

        {/* Confirm delete department */}
        <ConfirmModal open={!!confirmDeleteDept} onClose={() => setConfirmDeleteDept(null)}
          onConfirm={handleDeleteDept} loading={deleting}
          title="Delete Department?"
          message={confirmDeleteDept ? `Delete "${confirmDeleteDept.name}"? Members will remain but will be unassigned.` : ''}
          confirmLabel="Delete" />

        {/* Confirm delete cell group */}
        <ConfirmModal open={!!confirmDeleteCG} onClose={() => setConfirmDeleteCG(null)}
          onConfirm={handleDeleteCG} loading={deleting}
          title="Delete Cell Group?"
          message={confirmDeleteCG ? `Delete "${confirmDeleteCG.name}"? Members will be unassigned from this group.` : ''}
          confirmLabel="Delete" />

      </div>
    </>
  )
}