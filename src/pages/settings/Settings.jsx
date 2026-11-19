import { Fragment, useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  Building2, Users, Lock, CheckCircle,
  Edit2, Save, X, Plus, Shield,  Palette  // ← add Palette
} from 'lucide-react'
import AppearanceSettings from './AppearanceSettings'  // ← add this
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import BranchesTab from './BranchesTab'
import { GitBranch } from 'lucide-react'
import { fmtDate } from '../../utils/dates'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { KeyRound, ShieldCheck, Check } from 'lucide-react'

// Add Palette to your lucide imports:

// ─── TABS ─────────────────────────────────────
// `perm` = permissions that open the tab (any one). Same list the server enforces.
const TABS = [
  { id: 'profile',      label: 'Church Profile',  icon: Building2,   perm: ['settings.view'] },
  { id: 'team',         label: 'Team Members',    icon: Users,       perm: ['team.view', 'team.manage'] },
  { id: 'roles',        label: 'Roles & Access',  icon: ShieldCheck, perm: ['team.view', 'team.manage'] },
  { id: 'security',     label: 'Security',        icon: Lock,        perm: ['settings.view'] },
  { id: 'appearance',   label: 'Appearance',      icon: Palette,     perm: ['settings.view'] },
  { id: 'branches',     label: 'Branches',        icon: GitBranch,   perm: ['branches.manage'] },
]

// ─── ROLE BADGE ───────────────────────────────
function RoleBadge({ role }) {
  const map = {
    superadmin:  { label: 'Super Admin',  bg: '#F6EBD0', color: '#84590F' },
    pastor:      { label: 'Pastor',       bg: '#D1FAE5', color: '#065F46' },
    branch_admin:{ label: 'Branch Admin', bg: '#E0E7FF', color: '#3730A3' },
    admin:       { label: 'Admin',        bg: '#DBEAFE', color: '#1E40AF' },
    treasurer:   { label: 'Treasurer',    bg: '#FEF3C7', color: '#92400E' },
    staff:       { label: 'Staff',        bg: '#CCFBF1', color: '#115E59' },
    cell_leader: { label: 'Cell Leader',  bg: '#FCE7F3', color: '#9D174D' },
    member:      { label: 'Member',       bg: '#F1F5F9', color: '#475569' },
  }
  const config = map[role] || map.member
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, padding: '2px 10px',
      borderRadius: '999px', background: config.bg, color: config.color
    }}>
      {config.label}
    </span>
  )
}

// ─── CHURCH PROFILE TAB ───────────────────────
function ProfileTab({ token, org, onSaved, canEdit }) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:         org?.name         || '',
    denomination: org?.denomination || '',
    city:         org?.city         || '',
    email:        org?.email        || '',
    phone:        org?.phone        || '',
    address:      org?.address      || '',
  })

  useEffect(() => {
    if (org) setForm({
      name:         org.name         || '',
      denomination: org.denomination || '',
      city:         org.city         || '',
      email:        org.email        || '',
      phone:        org.phone        || '',
      address:      org.address      || '',
    })
  }, [org])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setEditing(false)
      onSaved(data.organization)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Church Profile</h3>
          <p className="settings-section-sub">Update your church information</p>
        </div>
        {!canEdit ? null : !editing ? (
          <button className="btn-outline" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn-outline" onClick={() => { setEditing(false); setError('') }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <X size={14} /> Cancel
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="settings-profile-grid">
        {[
          { label: 'Church Name',    name: 'name',         placeholder: 'e.g. Victory Chapel' },
          { label: 'Denomination',   name: 'denomination', placeholder: 'e.g. Pentecostal' },
          { label: 'City',           name: 'city',         placeholder: 'e.g. Accra' },
          { label: 'Church Email',   name: 'email',        placeholder: 'info@church.com' },
          { label: 'Church Phone',   name: 'phone',        placeholder: '024XXXXXXX' },
          { label: 'Address',        name: 'address',      placeholder: 'Full address' },
        ].map(({ label, name, placeholder }) => (
          <div className="settings-field" key={name}>
            <p className="settings-field-label">{label}</p>
            {editing ? (
              <input name={name} value={form[name]} onChange={handleChange}
                className="form-input" placeholder={placeholder} />
            ) : (
              <p className="settings-field-value">{form[name] || '—'}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
// ─── shared helpers ───────────────────────────
const API = import.meta.env.VITE_API_URL
const authHeaders = (token) => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` })

// ─── TEAM MEMBERS TAB ─────────────────────────
function TeamTab({ token }) {
  const { user: me, can } = useAuth()
  const canManage = can('team.manage')
  const isSuper   = me?.role === 'superadmin'
  const myBranch  = String(me?.branchId?._id ?? me?.branchId ?? '')
  // Super Admin manages everyone; a Pastor only the people below them in their own branch.
  const canManageRow = (u) => isSuper || (
    meta.assignable.includes(u.role) && String(u.branchId?._id ?? '') === myBranch
  )

  const [users, setUsers]         = useState([])
  const [meta, setMeta]           = useState({ roles: [], assignable: [] })
  const [branches, setBranches]   = useState([])
  const [cellGroups, setCellGroups] = useState([])
  const [loading, setLoading]     = useState(true)
  const [msg, setMsg]             = useState('')
  const [pageError, setPageError] = useState('')

  const [formOpen, setFormOpen]   = useState(false)
  const [editing, setEditing]     = useState(null)        // user being edited, or null = adding
  const [resetFor, setResetFor]   = useState(null)
  const [toggleFor, setToggleFor] = useState(null)

  const flash = (text) => { setMsg(text); setTimeout(() => setMsg(''), 4500) }

  const load = useCallback(async () => {
    try {
      const calls = [
        fetch(`${API}/settings/users`, { headers: authHeaders(token) }).then(r => r.json()),
        fetch(`${API}/settings/roles`, { headers: authHeaders(token) }).then(r => r.json()),
      ]
      if (canManage) {
        calls.push(fetch(`${API}/settings/branch-info`, { headers: authHeaders(token) }).then(r => r.json()))
        calls.push(fetch(`${API}/departments/cellgroups`, { headers: authHeaders(token) }).then(r => r.json()))
      }
      const [u, r, b, c] = await Promise.all(calls)
      if (u?.success) setUsers(u.users)
      if (r?.success) setMeta({ roles: r.roles, assignable: r.assignable })
      if (b?.success) setBranches(b.branchInfo.branches)
      if (c?.success) setCellGroups(c.cellGroups)
    } catch { setPageError('Could not load the team. Please try again.') }
    finally { setLoading(false) }
  }, [token, canManage])

  useEffect(() => { load() }, [load])

  const roleLabel = (key) => meta.roles.find(r => r.key === key)?.label || key

  const openAdd  = () => { setEditing(null); setFormOpen(true) }
  const openEdit = (u) => { setEditing(u); setFormOpen(true) }

  const handleSaved = (message) => { setFormOpen(false); setEditing(null); flash(message); load() }

  const toggleActive = async () => {
    const u = toggleFor
    try {
      const res  = await fetch(`${API}/settings/users/${u._id}`, {
        method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ isActive: !u.isActive })
      })
      const data = await res.json()
      if (data.success) { flash(`${u.name} ${u.isActive ? 'deactivated' : 'reactivated'}.`); load() }
      else setPageError(data.message)
    } catch { setPageError('Cannot connect to server.') }
    finally { setToggleFor(null) }
  }

  const handleToggleCrossBranch = async (userId, enabled) => {
    try {
      const res = await fetch(`${API}/settings/users/${userId}/cross-branch-access`, {
        method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ userId, enabled })
      })
      const data = await res.json()
      if (data.success) { flash(data.message); load() } else setPageError(data.message)
    } catch { setPageError('Failed to update cross-branch access.') }
  }

  if (loading) return <LoadingSpinner message="Loading team..." />

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Team Members</h3>
          <p className="settings-section-sub">
            {users.length} {users.length === 1 ? 'person has' : 'people have'} access to MinistryOS
            {!canManage && ' · only a Super Admin or Pastor can add or change team members'}
          </p>
        </div>
        {canManage && (
          <button className="btn-primary" onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Member
          </button>
        )}
      </div>

      {msg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--success-text)', marginBottom: 'var(--space-4)' }}>
          <CheckCircle size={16} /> {msg}
        </div>
      )}
      {pageError && <div className="form-error" style={{ marginBottom: 'var(--space-3)' }}>{pageError}</div>}

      <div className="settings-users-list">
        {users.map(u => {
          const isMe = String(u._id) === String(me?.id || me?._id)
          return (
            <div key={u._id} className="settings-user-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderBottom: '1px solid var(--border)', opacity: u.isActive ? 1 : 0.6 }}>
              <div className="settings-user-avatar">{u.name.charAt(0).toUpperCase()}</div>

              <div className="settings-user-info" style={{ flex: '1 1 200px', minWidth: 0 }}>
                <p className="settings-user-name">{u.name}{isMe && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}> (you)</span>}</p>
                <p className="settings-user-email">{u.email}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {u.branchId?.name ? `Branch: ${u.branchId.name}` : u.role === 'superadmin' ? 'All branches' : 'No branch'}
                  {u.role === 'cell_leader' && (
                    <> · Leads: {u.cellGroupIds.length ? u.cellGroupIds.map(c => c.name).join(', ') : <b style={{ color: 'var(--danger)' }}>no cell group yet</b>}</>
                  )}
                </p>
              </div>

              <RoleBadge role={u.role} />
              {!u.isActive && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, background: '#FEE2E2', color: '#991B1B' }}>Inactive</span>
              )}

              {isSuper && ['pastor', 'branch_admin'].includes(u.role) && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
                  title="Lets this person VIEW (never change) other branches">
                  <input type="checkbox" checked={u.crossBranchReadOnly}
                    onChange={(e) => handleToggleCrossBranch(u._id, e.target.checked)}
                    style={{ cursor: 'pointer', width: 16, height: 16 }} />
                  Cross-branch
                </label>
              )}

              <p className="settings-user-joined" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {u.lastLogin ? `Last login ${fmtDate(u.lastLogin, { day: 'numeric', month: 'short' })}` : `Added ${fmtDate(u.createdAt, { month: 'short', year: 'numeric' })}`}
              </p>

              {canManage && (isMe || canManageRow(u)) && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-outline" onClick={() => openEdit(u)} title="Edit role & access" style={{ padding: '6px 10px' }}><Edit2 size={14} /></button>
                  {!isMe && <button className="btn-outline" onClick={() => setResetFor(u)} title="Reset password" style={{ padding: '6px 10px' }}><KeyRound size={14} /></button>}
                  {!isMe && (
                    <button className="btn-outline" onClick={() => setToggleFor(u)} style={{ padding: '6px 10px', fontSize: 12 }}>
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {canManage && (
        <TeamMemberModal
          open={formOpen} onClose={() => { setFormOpen(false); setEditing(null) }}
          token={token} editing={editing} meta={meta}
          branches={isSuper ? branches : branches.filter(b => String(b._id) === myBranch)} cellGroups={cellGroups}
          isSelf={editing && String(editing._id) === String(me?.id || me?._id)}
          onSaved={handleSaved}
        />
      )}

      <ResetPasswordModal user={resetFor} token={token} onClose={() => setResetFor(null)}
        onDone={(m) => { setResetFor(null); flash(m) }} />

      <ConfirmModal
        open={!!toggleFor} onClose={() => setToggleFor(null)} onConfirm={toggleActive}
        title={toggleFor?.isActive ? 'Deactivate this person?' : 'Reactivate this person?'}
        message={toggleFor?.isActive
          ? `${toggleFor?.name} will be signed out and unable to log in until you reactivate them. Their history is kept.`
          : `${toggleFor?.name} will be able to log in again as ${roleLabel(toggleFor?.role)}.`}
        confirmLabel={toggleFor?.isActive ? 'Deactivate' : 'Reactivate'}
      />
    </div>
  )
}

// ─── ADD / EDIT TEAM MEMBER ───────────────────
// The form is mounted fresh each time the modal opens (keyed), so its starting
// values come straight from props — no effect needed to reset it.
function TeamMemberModal({ open, onClose, editing, ...rest }) {
  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit ${editing.name}` : 'Add Team Member'} size="md">
      {open && <TeamMemberForm key={editing?._id || 'new'} editing={editing} onClose={onClose} {...rest} />}
    </Modal>
  )
}

function TeamMemberForm({ onClose, token, editing, meta, branches, cellGroups, isSelf, onSaved }) {
  const [form, setForm] = useState(() => editing
    ? {
        name: editing.name, email: editing.email, phone: editing.phone || '',
        role: editing.role, password: '',
        branchId: editing.branchId?._id || '',
        cellGroupIds: (editing.cellGroupIds || []).map(c => c._id),
      }
    : {
        name: '', email: '', phone: '', role: 'admin', password: '',
        branchId: (branches.find(b => b.isMain) || branches[0])?._id || '',
        cellGroupIds: [],
      })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError('') }

  const roleInfo   = meta.roles.find(r => r.key === form.role)
  const needBranch = !!roleInfo?.branchBound
  const isCell     = !!roleInfo?.cellScoped
  const groupsHere = cellGroups.filter(g => String(g.branchId?._id || g.branchId) === String(form.branchId))
  const roleChoices = meta.roles.filter(r => meta.assignable.includes(r.key))

  const changeRole = (role) => setForm(p => ({ ...p, role, cellGroupIds: [] }))
  const changeBranch = (branchId) => setForm(p => ({ ...p, branchId, cellGroupIds: [] }))
  const toggleGroup = (id) => setForm(p => ({
    ...p, cellGroupIds: p.cellGroupIds.includes(id) ? p.cellGroupIds.filter(x => x !== id) : [...p.cellGroupIds, id]
  }))

  const submit = async (e) => {
    e.preventDefault()
    if (needBranch && !form.branchId) return setError('Please choose a branch.')
    if (isCell && form.cellGroupIds.length === 0) return setError('Choose at least one cell group for this cell leader.')
    setSaving(true)
    try {
      const body = editing
        ? { name: form.name, phone: form.phone,
            ...(isSelf ? {} : { role: form.role, branchId: needBranch ? form.branchId : null, cellGroupIds: isCell ? form.cellGroupIds : [] }) }
        : { name: form.name, email: form.email, phone: form.phone, password: form.password, role: form.role,
            branchId: needBranch ? form.branchId : undefined, cellGroupIds: isCell ? form.cellGroupIds : undefined }
      const res  = await fetch(editing ? `${API}/settings/users/${editing._id}` : `${API}/settings/users/invite`, {
        method: editing ? 'PUT' : 'POST', headers: authHeaders(token), body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!data.success) return setError(data.message)
      onSaved(data.message || 'Saved.')
    } catch { setError('Cannot connect to server.') }
    finally { setSaving(false) }
  }

  return (
      <form onSubmit={submit} className="member-form">
        {error && <div className="form-error">{error}</div>}
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="form-input" placeholder="e.g. Pastor John Doe" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="form-input"
                placeholder="john@church.com" required disabled={!!editing} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone (for password reset by SMS)</label>
              <input value={form.phone} onChange={e => set('phone', e.target.value)} className="form-input" placeholder="024XXXXXXX" />
            </div>
          </div>

          {isSelf ? (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>You can't change your own role or access.</p>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select value={form.role} onChange={e => changeRole(e.target.value)} className="form-input">
                  {roleChoices.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                </select>
                {roleInfo && (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
                    {roleInfo.description} <b>Sees:</b> {roleInfo.scope}.
                  </p>
                )}
              </div>

              {needBranch && (
                <div className="form-group">
                  <label className="form-label">Branch *</label>
                  <select value={form.branchId} onChange={e => changeBranch(e.target.value)} className="form-input" required>
                    <option value="">Select a branch…</option>
                    {branches.map(b => <option key={b._id} value={b._id}>{b.name}{b.isMain ? ' (main)' : ''}</option>)}
                  </select>
                </div>
              )}

              {isCell && (
                <div className="form-group">
                  <label className="form-label">Cell group(s) this leader looks after *</label>
                  {groupsHere.length === 0 ? (
                    <p style={{ fontSize: 12, color: 'var(--danger)' }}>
                      No cell groups in this branch yet. Create them under Departments → Cell Groups first.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {groupsHere.map(g => (
                        <label key={g._id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 999, fontSize: 13, cursor: 'pointer', background: form.cellGroupIds.includes(g._id) ? 'var(--primary-light, #EEF2FF)' : 'transparent' }}>
                          <input type="checkbox" checked={form.cellGroupIds.includes(g._id)} onChange={() => toggleGroup(g._id)} />
                          {g.name}
                        </label>
                      ))}
                    </div>
                  )}
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    They will see only the members in these groups — nothing else.
                  </p>
                </div>
              )}
            </>
          )}

          {!editing && (
            <div className="form-group">
              <label className="form-label">Temporary Password *</label>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} className="form-input" placeholder="Min. 8 characters" required minLength={8} />
            </div>
          )}
        </div>
        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Team Member'}
          </button>
        </div>
      </form>
  )
}

// ─── RESET PASSWORD ───────────────────────────
function ResetPasswordModal({ user, onClose, ...rest }) {
  return (
    <Modal open={!!user} onClose={onClose} title={`Reset password — ${user?.name || ''}`} size="sm">
      {user && <ResetPasswordForm key={user._id} user={user} onClose={onClose} {...rest} />}
    </Modal>
  )
}

function ResetPasswordForm({ user, token, onClose, onDone }) {
  const [pw, setPw] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res  = await fetch(`${API}/settings/users/${user._id}/reset-password`, {
        method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ newPassword: pw })
      })
      const data = await res.json()
      if (!data.success) return setError(data.message)
      onDone(data.message)
    } catch { setError('Cannot connect to server.') }
    finally { setSaving(false) }
  }

  return (
      <form onSubmit={submit} className="member-form">
        {error && <div className="form-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">New temporary password</label>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setError('') }} className="form-input" placeholder="Min. 8 characters" required minLength={8} />
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Share it with them privately and ask them to change it under Settings → Security.</p>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Reset password'}</button>
        </div>
      </form>
  )
}

// ─── ROLES & ACCESS (read-only matrix, generated from the server's rules) ────
function RolesTab({ token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/settings/roles`, { headers: authHeaders(token) })
      .then(r => r.json()).then(d => { if (d.success) setData(d) })
      .catch(() => null).finally(() => setLoading(false))
  }, [token])

  if (loading) return <LoadingSpinner message="Loading roles..." />
  if (!data) return <div className="form-error">Could not load roles.</div>

  const roles = data.roles.filter(r => r.key !== 'member')

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Roles & Access</h3>
          <p className="settings-section-sub">What each role can do. These rules are enforced by the server on every request.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {roles.map(r => (
          <div key={r.key} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
            <RoleBadge role={r.key} />
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '8px 0 4px', lineHeight: 1.5 }}>{r.description}</p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sees: {r.scope}</p>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 10px', position: 'sticky', left: 0, background: 'var(--surface, #fff)' }}>Permission</th>
              {roles.map(r => <th key={r.key} style={{ padding: '8px 6px', fontSize: 11, whiteSpace: 'nowrap' }}>{r.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.groups.map(g => (
              <Fragment key={g.key}>
                <tr><td colSpan={roles.length + 1} style={{ padding: '10px 10px 4px', fontWeight: 700, fontSize: 12, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{g.label}</td></tr>
                {g.permissions.map(p => (
                  <tr key={p.key} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 10px', position: 'sticky', left: 0, background: 'var(--surface, #fff)' }}>{p.label}</td>
                    {roles.map(r => (
                      <td key={r.key} style={{ textAlign: 'center', padding: '6px' }}>
                        {r.permissions.includes(p.key) ? <Check size={15} color="var(--success)" /> : <span style={{ color: 'var(--text-muted)' }}>·</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── SUBSCRIPTION TAB ─────────────────────────
function SubscriptionTab({ org }) {
  const plans = [
    { id: 'starter',    name: 'Starter',    price: 'GHS 200/mo',  members: 'Up to 200 members',   color: 'var(--primary)'  },
    { id: 'growth',     name: 'Growth',     price: 'GHS 350/mo',  members: 'Up to 500 members',   color: 'var(--success)'  },
    { id: 'enterprise', name: 'Enterprise', price: 'GHS 500/mo',  members: 'Unlimited members',   color: 'var(--accent)'   },
  ]

  const trialDaysLeft = org?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(org.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24)))
    : 30

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Subscription</h3>
          <p className="settings-section-sub">Manage your MinistryOS plan</p>
        </div>
      </div>

      {/* Trial Banner */}
      {org?.subscriptionStatus === 'trial' && (
        <div className="settings-trial-banner">
          <AlertCircle size={18} color="var(--warning)" />
          <div>
            <p style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              You are on a free trial
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
              {trialDaysLeft > 0
                ? `${trialDaysLeft} days remaining. Upgrade to keep full access.`
                : 'Your trial has ended. Please upgrade to continue.'}
            </p>
          </div>
        </div>
      )}

      {/* Current Plan */}
      <div className="settings-current-plan">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Crown size={16} color="var(--warning)" />
          <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>
            Current Plan: <span style={{ textTransform: 'capitalize' }}>{org?.subscriptionPlan || 'Starter'}</span>
          </p>
        </div>
        <span style={{
          fontSize: '11px', padding: '2px 10px', borderRadius: '999px', fontWeight: 600,
          background: org?.subscriptionStatus === 'active' ? 'var(--success-bg)' : 'var(--warning-bg)',
          color: org?.subscriptionStatus === 'active' ? 'var(--success-text)' : 'var(--warning-text)'
        }}>
          {org?.subscriptionStatus === 'trial' ? 'Free Trial' : org?.subscriptionStatus}
        </span>
      </div>

      {/* Plans */}
      <div className="settings-plans-grid">
        {plans.map(plan => (
          <div key={plan.id} className={`settings-plan-card ${org?.subscriptionPlan === plan.id ? 'current' : ''}`}>
            <div className="settings-plan-dot" style={{ background: plan.color }} />
            <h4 className="settings-plan-name">{plan.name}</h4>
            <p className="settings-plan-price">{plan.price}</p>
            <p className="settings-plan-members">{plan.members}</p>
            {org?.subscriptionPlan === plan.id ? (
              <span className="settings-plan-current-badge">Current Plan</span>
            ) : (
              <button className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-3)' }}>
                Upgrade
              </button>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center', marginTop: 'var(--space-4)' }}>
        To upgrade, contact EM Control IT Solutions · emcontrol01@gmail.com · 0553951396
      </p>
    </div>
  )
}

// ─── SECURITY TAB ─────────────────────────────
function SecurityTab({ token }) {
  const [form, setForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match.'); return }
    if (form.newPassword.length < 8) { setError('New password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setSuccess('Password changed successfully.')
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Security</h3>
          <p className="settings-section-sub">Change your account password</p>
        </div>
      </div>

      <div className="settings-security-form">
        <form onSubmit={handleSubmit} className="member-form">
          {error   && <div className="form-error">{error}</div>}
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--success-text)' }}>
              <CheckCircle size={16} /> {success}
            </div>
          )}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input name="currentPassword" type="password" value={form.currentPassword}
                onChange={handleChange} className="form-input" placeholder="Your current password" />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input name="newPassword" type="password" value={form.newPassword}
                onChange={handleChange} className="form-input" placeholder="Minimum 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handleChange} className="form-input" placeholder="Repeat new password" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              <Shield size={14} />
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── MAIN SETTINGS PAGE ───────────────────────
export default function Settings() {
  const { token, user, can } = useAuth()
  const visibleTabs = TABS.filter(tab => can(...tab.perm))
  const [activeTab, setActiveTab] = useState('profile')
  const [org, setOrg]             = useState(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) setOrg(data.organization)
      } catch {}
      finally { setLoading(false) }
    }
    fetchOrg()
  }, [token])

  if (loading) return <LoadingSpinner message="Loading settings..." />

  return (
    <div className="settings-page">

      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">{org?.name} · {user?.role}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="settings-content">
     {activeTab === 'branches' && (
  <BranchesTab token={token} userRole={user?.role} />
)}
  {activeTab === 'profile'      && <ProfileTab      token={token} org={org} onSaved={setOrg} canEdit={can('settings.profile.edit')} />}
  {activeTab === 'team'         && <TeamTab         token={token} />}
  {activeTab === 'roles'        && <RolesTab        token={token} />}
  {activeTab === 'appearance'   && (                                   // ← add this block
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Appearance</h3>
          <p className="settings-section-sub">Customize how MinistryOS looks and feels</p>
        </div>
      </div>
      <AppearanceSettings />
    </div>
  )}
  {activeTab === 'security'     && <SecurityTab     token={token} />}
</div>
    </div>
  )
}
