import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Building2, Users, ChevronDown,
  ChevronRight, Edit2, CheckCircle,
  UserCheck, Crown, UserPlus, X, Trash2
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── DEPARTMENT FORM ──────────────────────────
function DepartmentForm({ api, onSuccess, onClose, editing }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: editing?.name || '',
    description: editing?.description || '',
    color: editing?.color || '#4F46E5'
  })
  const COLORS = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0F172A']

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Department name is required.'); return }
    setLoading(true)
    try {
      const data = await api(editing ? `/departments/${editing._id}` : '/departments', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(form)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.department)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">Department Name *</label>
          <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Sanctuary Choir, Protocol Team" />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Brief description" />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-picker">
            {COLORS.map(c => (
              <button key={c} type="button" className={`color-swatch ${form.color === c ? 'selected' : ''}`} style={{ background: c }} onClick={() => setForm(p => ({ ...p, color: c }))} />
            ))}
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Department')}
        </button>
      </div>
    </form>
  )
}

// ─── CELL GROUP FORM ──────────────────────────
function CellGroupForm({ api, departments, onSuccess, onClose, editing, defaultDeptId }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: editing?.name || '',
    departmentId: editing?.departmentId?._id || editing?.departmentId || defaultDeptId || '',
    description: editing?.description || '',
    meetingDay: editing?.meetingDay || '',
    meetingTime: editing?.meetingTime || '',
    meetingLocation: editing?.meetingLocation || ''
  })

  const handleChange = (e) => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Cell group name is required.'); return }
    setLoading(true)
    try {
      const payload = { ...form, departmentId: form.departmentId || null }
      const data = await api(editing ? `/departments/cellgroups/${editing._id}` : '/departments/cellgroups', {
        method: editing ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      })
      if (!data.success) { setError(data.message); return }
      onSuccess(data.cellGroup)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}
      <div className="form-section">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cell Group Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="form-input" placeholder="e.g. Matthew, Eagles Cell" />
          </div>
          <div className="form-group">
            <label className="form-label">Department (optional)</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="form-input">
              <option value="">No department (general)</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input name="description" value={form.description} onChange={handleChange} className="form-input" placeholder="Brief description" />
        </div>
        <p className="form-section-title" style={{ marginTop: 'var(--space-2)' }}>Meeting Details</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Meeting Day</label>
            <select name="meetingDay" value={form.meetingDay} onChange={handleChange} className="form-input">
              <option value="">Select day</option>
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Meeting Time</label>
            <input name="meetingTime" value={form.meetingTime} onChange={handleChange} className="form-input" placeholder="e.g. 6:00 PM" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Meeting Location</label>
          <input name="meetingLocation" value={form.meetingLocation} onChange={handleChange} className="form-input" placeholder="e.g. Main Hall, Room 3" />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Cell Group')}
        </button>
      </div>
    </form>
  )
}

// ─── CELL GROUP EXPANDED VIEW ─────────────────
function CellGroupExpanded({ group, api, onSetLeader, onAssignMember, onRefresh }) {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [removing, setRemoving] = useState(false)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(`/members?cellGroupId=${group._id}&limit=100`)
      if (data.success) setMembers(data.members)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [group._id, api])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleRemoveMember = async () => {
    setRemoving(true)
    try {
      await api(`/members/${confirmRemove._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellGroupId: null })
      })
      setMembers(prev => prev.filter(m => m._id !== confirmRemove._id))
      setConfirmRemove(null)
      onRefresh()
    } catch (err) { console.error(err) }
    finally { setRemoving(false) }
  }

  const leader = members.find(m => m._id === (group.leaderId?._id || group.leaderId))

  return (
    <div className="cellgroup-expanded">
      {/* Leader */}
      <div className="cellgroup-leader-section">
        <div className="cellgroup-leader-label">
          <Crown size={13} color="var(--warning)" />
          <span>Cell Leader</span>
        </div>
        {leader ? (
          <div className="cellgroup-leader-info">
            <div className="member-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
              {leader.firstName[0]}{leader.lastName[0]}
            </div>
            <span className="cellgroup-leader-name">{leader.firstName} {leader.lastName}</span>
            <button className="cellgroup-action-link" onClick={() => onSetLeader(group, members)}>Change</button>
          </div>
        ) : (
          <button className="cellgroup-action-link" onClick={() => onSetLeader(group, members)}>+ Assign Leader</button>
        )}
      </div>

      {/* Members */}
      {loading ? <LoadingSpinner message="Loading..." /> : members.length === 0 ? (
        <div className="cellgroup-empty-members">
          <Users size={20} color="var(--text-muted)" />
          <p>No members in this group yet.</p>
          <button className="btn-ghost" onClick={() => onAssignMember(group)}>+ Assign Members</button>
        </div>
      ) : (
        <div className="cellgroup-members-list">
          {members.map(m => {
            const isLeader = m._id === (group.leaderId?._id || group.leaderId)
            return (
              <div key={m._id} className="cellgroup-member-row">
                <div className="cellgroup-member-left">
                  <div className="member-avatar" style={{
                    width: 30, height: 30, fontSize: 11,
                    background: isLeader ? '#FEF3C7' : 'var(--primary-light)',
                    color: isLeader ? '#D97706' : 'var(--primary)'
                  }}>
                    {m.firstName[0]}{m.lastName[0]}
                  </div>
                  <div>
                    <span className="cellgroup-member-name">
                      {m.firstName} {m.lastName}
                      {isLeader && <span className="cellgroup-leader-badge"><Crown size={10} /> Leader</span>}
                    </span>
                    <span className="cellgroup-member-phone">{m.phone}</span>
                  </div>
                </div>
                <button className="cellgroup-remove-btn" onClick={() => setConfirmRemove(m)} title="Remove from group">
                  <X size={13} />
                </button>
              </div>
            )
          })}
          <button className="dept-add-group-btn" style={{ marginTop: 'var(--space-2)' }} onClick={() => onAssignMember(group)}>
            <UserPlus size={13} /> Assign Member
          </button>
        </div>
      )}

      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemoveMember}
        loading={removing}
        title="Remove from group?"
        message={confirmRemove ? `Remove ${confirmRemove.firstName} ${confirmRemove.lastName} from ${group.name}? They will remain a church member.` : ''}
        confirmLabel="Remove"
      />
    </div>
  )
}

// ─── CELL GROUP CARD ──────────────────────────
function CellGroupCard({ group, api, onEdit, onDelete, onSetLeader, onAssignMember, onRefresh }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="cellgroup-card-wrap">
      <div className="cellgroup-card" onClick={() => setExpanded(!expanded)}>
        <div className="cellgroup-card-left">
          <div className="cellgroup-icon"><Users size={14} color="var(--primary)" /></div>
          <div>
            <p className="cellgroup-name">{group.name}</p>
            <div className="cellgroup-meta">
              {group.meetingDay && <span>{group.meetingDay.charAt(0).toUpperCase() + group.meetingDay.slice(1)}{group.meetingTime && ` · ${group.meetingTime}`}</span>}
              {group.meetingLocation && <span>{group.meetingLocation}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button className="cellgroup-edit-btn" onClick={e => { e.stopPropagation(); onEdit(group) }} title="Edit"><Edit2 size={14} /></button>
          <button className="cellgroup-edit-btn" style={{ color: 'var(--danger)' }} onClick={e => { e.stopPropagation(); onDelete(group) }} title="Delete"><Trash2 size={14} /></button>
          {expanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>
      {expanded && (
        <CellGroupExpanded
          group={group} api={api}
          onSetLeader={onSetLeader}
          onAssignMember={onAssignMember}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}

// ─── DEPARTMENT CARD ──────────────────────────
function DepartmentCard({ dept, cellGroups, api, onEditDept, onDeleteDept, onEditGroup, onDeleteGroup, onAddGroup, onSetLeader, onAssignMember, onRefresh }) {
  const [expanded, setExpanded] = useState(true)
  const deptGroups = cellGroups.filter(g => (g.departmentId?._id || g.departmentId) === dept._id)

  return (
    <div className="dept-card">
      <div className="dept-card-header" onClick={() => setExpanded(!expanded)}>
        <div className="dept-card-left">
          <div className="dept-color-bar" style={{ background: dept.color }} />
          <div>
            <p className="dept-name">{dept.name}</p>
            {dept.description && <p className="dept-description">{dept.description}</p>}
          </div>
        </div>
        <div className="dept-card-right">
          <span className="dept-member-count"><UserCheck size={13} />{dept.memberCount || 0} members</span>
          <span className="dept-group-count"><Users size={13} />{deptGroups.length} groups</span>
          <button className="dept-edit-btn" onClick={e => { e.stopPropagation(); onEditDept(dept) }} title="Edit"><Edit2 size={14} /></button>
          <button className="dept-edit-btn" style={{ color: 'var(--danger)' }} onClick={e => { e.stopPropagation(); onDeleteDept(dept) }} title="Delete"><Trash2 size={14} /></button>
          {expanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>
      {expanded && (
        <div className="dept-groups-section">
          {deptGroups.length === 0 ? (
            <div className="dept-empty-groups">
              <p>No cell groups yet.</p>
              <button className="btn-ghost" onClick={() => onAddGroup(dept)}>+ Add Cell Group</button>
            </div>
          ) : (
            <>
              {deptGroups.map(group => (
                <CellGroupCard key={group._id} group={group} api={api}
                  onEdit={onEditGroup} onDelete={onDeleteGroup}
                  onSetLeader={onSetLeader} onAssignMember={onAssignMember} onRefresh={onRefresh}
                />
              ))}
              <button className="dept-add-group-btn" onClick={() => onAddGroup(dept)}>
                <Plus size={14} /> Add Cell Group
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── SET LEADER MODAL ─────────────────────────
function SetLeaderModal({ group, members, api, onSuccess, onClose }) {
  const [selected, setSelected] = useState(group.leaderId?._id || group.leaderId || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const data = await api(`/departments/cellgroups/${group._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderId: selected || null })
      })
      if (data.success) onSuccess()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <div className="member-form">
      <div className="form-section">
        <p className="form-section-title">Select Cell Leader for {group.name}</p>
        <div className="leader-select-list">
          <div className={`leader-select-row ${selected === '' ? 'selected' : ''}`} onClick={() => setSelected('')}>
            <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>—</div>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>No leader assigned</span>
          </div>
          {members.map(m => (
            <div key={m._id} className={`leader-select-row ${selected === m._id ? 'selected' : ''}`} onClick={() => setSelected(m._id)}>
              <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{m.firstName[0]}{m.lastName[0]}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{m.firstName} {m.lastName}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.memberId}</p>
              </div>
              {selected === m._id && <CheckCircle size={16} color="var(--primary)" />}
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Set Leader'}</button>
      </div>
    </div>
  )
}

// ─── ASSIGN MEMBER MODAL ──────────────────────
function AssignMemberModal({ group, api, onSuccess, onClose }) {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(null)
  const [assigned, setAssigned] = useState([])

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await api('/members?limit=200')
        if (data.success) setMembers(data.members)
      } catch {}
      finally { setLoading(false) }
    }
    fetchMembers()
  }, [api])

  const handleAssign = async (memberId) => {
    setAssigning(memberId)
    try {
      await api(`/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cellGroupId: group._id })
      })
      setAssigned(prev => [...prev, memberId])
      onSuccess()
    } catch {}
    finally { setAssigning(null) }
  }

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="member-form">
      <div className="form-section">
        <p className="form-section-title">Assign members to {group.name}</p>
        <input value={search} onChange={e => setSearch(e.target.value)} className="form-input" placeholder="Search by name or phone..." />
        {loading ? <LoadingSpinner /> : (
          <div className="leader-select-list" style={{ marginTop: 'var(--space-3)' }}>
            {filtered.map(m => {
              const isAssigned = assigned.includes(m._id) || (m.cellGroupId?._id || m.cellGroupId) === group._id
              return (
                <div key={m._id} className="leader-select-row">
                  <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{m.firstName[0]}{m.lastName[0]}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)' }}>{m.firstName} {m.lastName}</p>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.memberId}</p>
                  </div>
                  {isAssigned ? (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 'var(--weight-semibold)' }}>✓ Assigned</span>
                  ) : (
                    <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                      onClick={() => handleAssign(m._id)} disabled={assigning === m._id}>
                      {assigning === m._id ? '...' : 'Assign'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────
export default function Departments() {
  const { api, branchReady } = useApi()
  const [departments, setDepartments]   = useState([])
  const [cellGroups, setCellGroups]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [successMsg, setSuccessMsg]     = useState('')
  const [deptModal, setDeptModal]       = useState(false)
  const [groupModal, setGroupModal]     = useState(false)
  const [leaderModal, setLeaderModal]   = useState(false)
  const [assignModal, setAssignModal]   = useState(false)
  const [editingDept, setEditingDept]   = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [defaultDept, setDefaultDept]   = useState(null)
  const [leaderTarget, setLeaderTarget] = useState({ group: null, members: [] })
  const [assignTarget, setAssignTarget] = useState(null)
  const [confirmDeleteDept, setConfirmDeleteDept]   = useState(null)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  const fetchData = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const [dRes, gRes] = await Promise.all([
        api('/departments'),
        api('/departments/cellgroups'),
      ])
      const [dData, gData] = await Promise.all([dRes, gRes])
      if (dData.success) setDepartments(dData.departments)
      if (gData.success) setCellGroups(gData.cellGroups)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [api, branchReady])

  useEffect(() => { fetchData() }, [fetchData])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000) }

  const handleDeleteDept = async () => {
    setDeleting(true)
    try {
      await api(`/departments/${confirmDeleteDept._id}`, {
        method: 'DELETE', 
      })
      setConfirmDeleteDept(null)
      fetchData()
      showSuccess('Department deleted.')
    } catch {}
    finally { setDeleting(false) }
  }

  const handleDeleteGroup = async () => {
    setDeleting(true)
    try {
      await api(`/departments/cellgroups/${confirmDeleteGroup._id}`, {
        method: 'DELETE', 
      })
      setConfirmDeleteGroup(null)
      fetchData()
      showSuccess('Cell group deleted.')
    } catch {}
    finally { setDeleting(false) }
  }

  return (
    <div className="departments-page">

      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Departments & Cell Groups</h1>
          <p className="page-subtitle">{departments.length} departments · {cellGroups.length} cell groups</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button className="btn-outline" onClick={() => { setEditingGroup(null); setDefaultDept(null); setGroupModal(true) }}>
            <Plus size={16} /> Add Cell Group
          </button>
          <button className="btn-primary" onClick={() => { setEditingDept(null); setDeptModal(true) }}>
            <Plus size={16} /> New Department
          </button>
        </div>
      </div>

      <div className="dept-summary-row">
        {[
          { label: 'Total Departments', value: departments.length, icon: Building2, color: 'var(--primary)' },
          { label: 'Total Cell Groups', value: cellGroups.length, icon: Users, color: 'var(--success)' },
          { label: 'Total Cell Groups (General)', value: cellGroups.filter(g => !g.departmentId).length, icon: UserCheck, color: 'var(--info)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div className="dept-stat-card" key={label}>
            <div className="dept-stat-icon" style={{ background: color + '18' }}><Icon size={18} color={color} /></div>
            <div><p className="dept-stat-value">{value}</p><p className="dept-stat-label">{label}</p></div>
          </div>
        ))}
      </div>

      {loading ? <LoadingSpinner message="Loading..." /> : departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" message="Create your first department."
          action={{ label: '+ New Department', onClick: () => setDeptModal(true) }} />
      ) : (
        <div className="departments-list">
          {departments.map(dept => (
            <DepartmentCard key={dept._id} dept={dept} cellGroups={cellGroups} api={api}
              onEditDept={d => { setEditingDept(d); setDeptModal(true) }}
              onDeleteDept={d => setConfirmDeleteDept(d)}
              onEditGroup={g => { setEditingGroup(g); setGroupModal(true) }}
              onDeleteGroup={g => setConfirmDeleteGroup(g)}
              onAddGroup={d => { setDefaultDept(d); setEditingGroup(null); setGroupModal(true) }}
              onSetLeader={(g, m) => { setLeaderTarget({ group: g, members: m }); setLeaderModal(true) }}
              onAssignMember={g => { setAssignTarget(g); setAssignModal(true) }}
              onRefresh={fetchData}
            />
          ))}

          {cellGroups.filter(g => !g.departmentId).length > 0 && (
            <div className="dept-card">
              <div className="dept-card-header">
                <div className="dept-card-left">
                  <div className="dept-color-bar" style={{ background: '#94A3B8' }} />
                  <div>
                    <p className="dept-name">General Cell Groups</p>
                    <p className="dept-description">Cell groups not assigned to a department</p>
                  </div>
                </div>
                <div className="dept-card-right">
                  <span className="dept-group-count"><Users size={13} />{cellGroups.filter(g => !g.departmentId).length} groups</span>
                </div>
              </div>
              <div className="dept-groups-section">
                {cellGroups.filter(g => !g.departmentId).map(group => (
                  <CellGroupCard key={group._id} group={group} api={api}
                    onEdit={g => { setEditingGroup(g); setGroupModal(true) }}
                    onDelete={g => setConfirmDeleteGroup(g)}
                    onSetLeader={(g, m) => { setLeaderTarget({ group: g, members: m }); setLeaderModal(true) }}
                    onAssignMember={g => { setAssignTarget(g); setAssignModal(true) }}
                    onRefresh={fetchData}
                  />
                ))}
                <button className="dept-add-group-btn" onClick={() => { setDefaultDept(null); setEditingGroup(null); setGroupModal(true) }}>
                  <Plus size={14} /> Add Cell Group
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal open={deptModal} onClose={() => { setDeptModal(false); setEditingDept(null) }}
        title={editingDept ? 'Edit Department' : 'New Department'} size="md">
        <DepartmentForm api={api} editing={editingDept}
          onSuccess={() => { setDeptModal(false); setEditingDept(null); fetchData(); showSuccess('Department saved.') }}
          onClose={() => { setDeptModal(false); setEditingDept(null) }} />
      </Modal>

      <Modal open={groupModal} onClose={() => { setGroupModal(false); setEditingGroup(null); setDefaultDept(null) }}
        title={editingGroup ? 'Edit Cell Group' : 'New Cell Group'} size="md">
        <CellGroupForm api={api} departments={departments} editing={editingGroup}
          defaultDeptId={defaultDept?._id}
          onSuccess={() => { setGroupModal(false); setEditingGroup(null); setDefaultDept(null); fetchData(); showSuccess('Cell group saved.') }}
          onClose={() => { setGroupModal(false); setEditingGroup(null); setDefaultDept(null) }} />
      </Modal>

      <Modal open={leaderModal} onClose={() => setLeaderModal(false)} title="Set Cell Leader" size="md">
        {leaderTarget.group && (
          <SetLeaderModal group={leaderTarget.group} members={leaderTarget.members} api={api}
            onSuccess={() => { setLeaderModal(false); fetchData(); showSuccess('Cell leader assigned.') }}
            onClose={() => setLeaderModal(false)} />
        )}
      </Modal>

      <Modal open={assignModal} onClose={() => setAssignModal(false)} title="Assign Member to Cell Group" size="md">
        {assignTarget && (
          <AssignMemberModal group={assignTarget} api={api}
            onSuccess={() => fetchData()}
            onClose={() => setAssignModal(false)} />
        )}
      </Modal>

      {/* Confirm Delete Department */}
      <ConfirmModal
        open={!!confirmDeleteDept}
        onClose={() => setConfirmDeleteDept(null)}
        onConfirm={handleDeleteDept}
        loading={deleting}
        title="Delete Department?"
        message={confirmDeleteDept ? `Delete "${confirmDeleteDept.name}"? Cell groups inside will not be deleted but will become unassigned.` : ''}
        confirmLabel="Delete Department"
      />

      {/* Confirm Delete Cell Group */}
      <ConfirmModal
        open={!!confirmDeleteGroup}
        onClose={() => setConfirmDeleteGroup(null)}
        onConfirm={handleDeleteGroup}
        loading={deleting}
        title="Delete Cell Group?"
        message={confirmDeleteGroup ? `Delete "${confirmDeleteGroup.name}"? Members in this group will be unassigned.` : ''}
        confirmLabel="Delete Cell Group"
      />
    </div>
  )
}