import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  Plus, Edit2, Trash2, Users, UserCheck, UserPlus,
  ChevronDown, ChevronRight, CheckCircle
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── DEPARTMENT FORM ──────────────────────────
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
          <textarea className="form-input" rows={3} value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <input type="color" value={form.color}
            onChange={e => setForm(p => ({ ...p, color: e.target.value }))}
            style={{ height: 40, padding: 2, border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : editing ? 'Update Department' : 'Create Department'}
        </button>
      </div>
    </form>
  )
}

// ─── CELL GROUP FORM ──────────────────────────
function CellGroupForm({ api, editing, defaultDept, departments, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:            editing?.name            || '',
    departmentId:    editing?.departmentId?._id || editing?.departmentId || defaultDept?._id || '',
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
      const data = await api(
        editing ? `/departments/cellgroups/${editing._id}` : '/departments/cellgroups',
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
          <label className="form-label">Cell Group Name *</label>
          <input className="form-input" value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Department</label>
          <select className="form-input" value={form.departmentId}
            onChange={e => setForm(p => ({ ...p, departmentId: e.target.value }))}>
            <option value="">No department</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
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
          {loading ? 'Saving...' : editing ? 'Update Cell Group' : 'Create Cell Group'}
        </button>
      </div>
    </form>
  )
}

// ─── SET LEADER MODAL ─────────────────────────
function SetLeaderModal({ group, members, api, onSuccess, onClose }) {
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
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" placeholder="Search member..." style={{ marginBottom: 'var(--space-3)' }} />
        <div className="leader-select-list">
          <div className="leader-select-row" onClick={() => setLeaderId('')} style={{ cursor: 'pointer' }}>
            <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12, background: 'var(--surface-2)' }}>—</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>No leader</p>
            </div>
            {!leaderId && <CheckCircle size={16} color="var(--success)" />}
          </div>
          {filtered.map(m => (
            <div key={m._id} className="leader-select-row" onClick={() => setLeaderId(m._id)} style={{ cursor: 'pointer' }}>
              <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                {m.firstName[0]}{m.lastName?.[0] || ''}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.firstName} {m.lastName}</p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.phone}</p>
              </div>
              {leaderId === m._id && <CheckCircle size={16} color="var(--success)" />}
            </div>
          ))}
        </div>
      </div>
      <div className="form-actions">
        <button className="btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Set Leader'}
        </button>
      </div>
    </div>
  )
}

// ─── ASSIGN MEMBER TO CELL GROUP MODAL ───────
function AssignMemberModal({ group, api, onSuccess, onClose }) {
  const [members, setMembers]   = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [assigning, setAssigning] = useState(null)
  const [assigned, setAssigned] = useState([])

  useEffect(() => {
    api('/members?limit=300').then(d => {
      if (d.success) setMembers(d.members)
    }).catch(console.error).finally(() => setLoading(false))
  }, [api])

  const handleAssign = async (memberId) => {
    setAssigning(memberId)
    try {
      const data = await api(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ cellGroupId: group._id })
      })
      if (data.success) setAssigned(prev => [...prev, memberId])
    } catch (err) { console.error(err) }
    finally { setAssigning(null) }
  }

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="member-form">
      <div className="form-section">
        <p className="form-section-title">Assign members to {group.name}</p>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" placeholder="Search by name or phone..." />
        {loading ? <LoadingSpinner /> : (
          <div className="leader-select-list" style={{ marginTop: 'var(--space-3)' }}>
            {filtered.length === 0
              ? <p style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</p>
              : filtered.map(m => {
                const isInGroup =
                  assigned.includes(m._id) ||
                  (m.cellGroupId?._id || m.cellGroupId) === group._id
                return (
                  <div key={m._id} className="leader-select-row">
                    <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      {m.firstName[0]}{m.lastName?.[0] || ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.firstName} {m.lastName}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {m.memberId} · {m.phone}
                      </p>
                    </div>
                    {isInGroup
                      ? <span style={{ fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 600 }}>✓ Assigned</span>
                      : <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                          onClick={() => handleAssign(m._id)} disabled={assigning === m._id}>
                          {assigning === m._id ? '...' : 'Assign'}
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

// ─── ASSIGN MEMBER TO DEPARTMENT MODAL ───────
function AssignToDepartmentModal({ dept, api, onSuccess, onClose }) {
  const [members, setMembers]   = useState([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [assigning, setAssigning] = useState(null)
  // Track locally-assigned IDs so UI updates immediately without reload
  const [locallyAssigned, setLocallyAssigned] = useState([])

  useEffect(() => {
    api('/members?limit=300').then(d => {
      if (d.success) setMembers(d.members)
    }).catch(console.error).finally(() => setLoading(false))
  }, [api])

  const handleAssign = async (memberId) => {
    setAssigning(memberId)
    try {
      const data = await api(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ departmentId: dept._id })
      })
      if (data.success) {
        setLocallyAssigned(prev => [...prev, memberId])
        // Update the local members array too so current dept shows correctly
        setMembers(prev => prev.map(m =>
          m._id === memberId
            ? { ...m, departmentId: { _id: dept._id, name: dept.name, color: dept.color } }
            : m
        ))
      }
    } catch (err) { console.error(err) }
    finally { setAssigning(null) }
  }

  const handleRemove = async (memberId) => {
    setAssigning(memberId)
    try {
      const data = await api(`/members/${memberId}`, {
        method: 'PUT',
        body: JSON.stringify({ departmentId: null })
      })
      if (data.success) {
        setLocallyAssigned(prev => prev.filter(id => id !== memberId))
        setMembers(prev => prev.map(m =>
          m._id === memberId ? { ...m, departmentId: null } : m
        ))
      }
    } catch (err) { console.error(err) }
    finally { setAssigning(null) }
  }

  const filtered = members.filter(m =>
    `${m.firstName} ${m.lastName} ${m.phone}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="member-form">
      <div className="form-section">
        <p className="form-section-title">Manage members in {dept.name}</p>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="form-input" placeholder="Search by name or phone..." />
        {loading ? <LoadingSpinner /> : (
          <div className="leader-select-list" style={{ marginTop: 'var(--space-3)' }}>
            {filtered.length === 0
              ? <p style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-muted)' }}>No members found</p>
              : filtered.map(m => {
                const memberDeptId = m.departmentId?._id || m.departmentId
                const isInThisDept =
                  locallyAssigned.includes(m._id) ||
                  (memberDeptId && String(memberDeptId) === String(dept._id))

                return (
                  <div key={m._id} className="leader-select-row">
                    <div className="member-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                      {m.firstName[0]}{m.lastName?.[0] || ''}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {m.firstName} {m.lastName}
                      </p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {m.memberId} · {m.phone}
                        {m.departmentId?.name && !isInThisDept
                          ? ` · Currently in: ${m.departmentId.name}` : ''}
                      </p>
                    </div>
                    {isInThisDept ? (
                      <button className="btn-outline" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                        onClick={() => handleRemove(m._id)} disabled={assigning === m._id}>
                        {assigning === m._id ? '...' : 'Remove'}
                      </button>
                    ) : (
                      <button className="btn-primary" style={{ padding: '4px 12px', fontSize: 'var(--text-xs)' }}
                        onClick={() => handleAssign(m._id)} disabled={assigning === m._id}>
                        {assigning === m._id ? '...' : 'Assign'}
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

// ─── CELL GROUP CARD ──────────────────────────
function CellGroupCard({ group, api, onEdit, onDelete, onSetLeader, onAssignMember, onRefresh }) {
  const leaderName = group.leaderId
    ? `${group.leaderId.firstName} ${group.leaderId.lastName}`
    : null

  return (
    <div className="cell-group-card">
      <div className="cell-group-info">
        <p className="cell-group-name">{group.name}</p>
        {leaderName && (
          <p className="cell-group-meta">Leader: {leaderName}</p>
        )}
        {group.meetingDay && (
          <p className="cell-group-meta">
            {group.meetingDay.charAt(0).toUpperCase() + group.meetingDay.slice(1)}
            {group.meetingTime ? ` · ${group.meetingTime}` : ''}
            {group.meetingLocation ? ` · ${group.meetingLocation}` : ''}
          </p>
        )}
      </div>
      <div className="cell-group-actions">
        <button className="dept-edit-btn" onClick={() => onAssignMember(group)} title="Assign Members">
          <UserPlus size={13} />
        </button>
        <button className="dept-edit-btn" onClick={() => onSetLeader(group)} title="Set Leader">
          <UserCheck size={13} />
        </button>
        <button className="dept-edit-btn" onClick={() => onEdit(group)} title="Edit">
          <Edit2 size={13} />
        </button>
        <button className="dept-edit-btn" style={{ color: 'var(--danger)' }} onClick={() => onDelete(group)} title="Delete">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── DEPARTMENT CARD ──────────────────────────
function DepartmentCard({
  dept, cellGroups, api,
  onEditDept, onDeleteDept,
  onEditGroup, onDeleteGroup, onAddGroup,
  onSetLeader, onAssignMember, onAssignMemberToDept,
  onRefresh
}) {
  const [expanded, setExpanded] = useState(true)
  const deptGroups = cellGroups.filter(g =>
    String(g.departmentId?._id || g.departmentId) === String(dept._id)
  )

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
          <button className="dept-edit-btn" onClick={e => { e.stopPropagation(); onEditDept(dept) }} title="Edit">
            <Edit2 size={14} />
          </button>
          <button className="dept-edit-btn" style={{ color: 'var(--danger)' }}
            onClick={e => { e.stopPropagation(); onDeleteDept(dept) }} title="Delete">
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {expanded && (
        <div className="dept-groups-section">
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <button className="btn-secondary" onClick={() => onAssignMemberToDept(dept)} style={{ width: '100%' }}>
              <UserPlus size={14} /> Manage Members in Department
            </button>
          </div>

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
                  onSetLeader={g => onSetLeader(g)} onAssignMember={onAssignMember}
                  onRefresh={onRefresh}
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

// ─── MAIN PAGE ────────────────────────────────
export default function Departments() {
  const { api, branchReady } = useApi()

  const [departments, setDepartments]   = useState([])
  const [cellGroups, setCellGroups]     = useState([])
  const [allMembers, setAllMembers]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [successMsg, setSuccessMsg]     = useState('')

  // Modals
  const [deptModal, setDeptModal]             = useState(false)
  const [groupModal, setGroupModal]           = useState(false)
  const [leaderModal, setLeaderModal]         = useState(false)
  const [assignModal, setAssignModal]         = useState(false)
  const [assignDeptModal, setAssignDeptModal] = useState(false)

  // Editing targets
  const [editingDept, setEditingDept]   = useState(null)
  const [editingGroup, setEditingGroup] = useState(null)
  const [defaultDept, setDefaultDept]   = useState(null)
  const [leaderTarget, setLeaderTarget] = useState(null)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignDeptTarget, setAssignDeptTarget] = useState(null)

  // Confirm delete
  const [confirmDeleteDept, setConfirmDeleteDept]   = useState(null)
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState(null)
  const [deleting, setDeleting]                     = useState(false)

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
    } catch (err) {
      console.error('Failed to fetch department data:', err)
    } finally {
      setLoading(false)
    }
  }, [api, branchReady])

  useEffect(() => { fetchData() }, [fetchData])

  // Delete department
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

  // Delete cell group
  const handleDeleteGroup = async () => {
    setDeleting(true)
    try {
      await api(`/departments/cellgroups/${confirmDeleteGroup._id}`, { method: 'DELETE' })
      setConfirmDeleteGroup(null)
      fetchData()
      showSuccess('Cell group deleted.')
    } catch {}
    finally { setDeleting(false) }
  }

  if (loading) return <LoadingSpinner message="Loading departments..." />

  return (
    <div className="departments-page">
      {successMsg && (
        <div className="success-toast"><CheckCircle size={16} /> {successMsg}</div>
      )}

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Departments & Cell Groups</h1>
          <p className="page-subtitle">{departments.length} departments · {cellGroups.length} cell groups</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditingDept(null); setDeptModal(true) }}>
          <Plus size={16} /> New Department
        </button>
      </div>

      {/* Department list */}
      {departments.length === 0 ? (
        <EmptyState icon={Users} title="No departments yet"
          message="Create your first department to organise your members."
          action={{ label: '+ New Department', onClick: () => { setEditingDept(null); setDeptModal(true) } }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {departments.map(dept => (
            <DepartmentCard
              key={dept._id}
              dept={dept}
              cellGroups={cellGroups}
              api={api}
              onEditDept={d => { setEditingDept(d); setDeptModal(true) }}
              onDeleteDept={d => setConfirmDeleteDept(d)}
              onEditGroup={g => { setEditingGroup(g); setGroupModal(true) }}
              onDeleteGroup={g => setConfirmDeleteGroup(g)}
              onAddGroup={d => { setDefaultDept(d); setEditingGroup(null); setGroupModal(true) }}
              onSetLeader={g => { setLeaderTarget(g); setLeaderModal(true) }}
              onAssignMember={g => { setAssignTarget(g); setAssignModal(true) }}
              onAssignMemberToDept={d => { setAssignDeptTarget(d); setAssignDeptModal(true) }}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      {/* ── MODALS ── */}

      {/* Department form */}
      <Modal open={deptModal} onClose={() => { setDeptModal(false); setEditingDept(null) }}
        title={editingDept ? 'Edit Department' : 'New Department'} size="md">
        <DepartmentForm api={api} editing={editingDept}
          onSuccess={() => { setDeptModal(false); setEditingDept(null); fetchData(); showSuccess('Department saved.') }}
          onClose={() => { setDeptModal(false); setEditingDept(null) }} />
      </Modal>

      {/* Cell group form */}
      <Modal open={groupModal} onClose={() => { setGroupModal(false); setEditingGroup(null) }}
        title={editingGroup ? 'Edit Cell Group' : 'New Cell Group'} size="md">
        <CellGroupForm api={api} editing={editingGroup} defaultDept={defaultDept} departments={departments}
          onSuccess={() => { setGroupModal(false); setEditingGroup(null); fetchData(); showSuccess('Cell group saved.') }}
          onClose={() => { setGroupModal(false); setEditingGroup(null) }} />
      </Modal>

      {/* Set leader */}
      <Modal open={leaderModal} onClose={() => { setLeaderModal(false); setLeaderTarget(null) }}
        title={`Set Leader — ${leaderTarget?.name || ''}`} size="md">
        {leaderTarget && (
          <SetLeaderModal group={leaderTarget} members={allMembers} api={api}
            onSuccess={() => { setLeaderModal(false); setLeaderTarget(null); fetchData(); showSuccess('Leader updated.') }}
            onClose={() => { setLeaderModal(false); setLeaderTarget(null) }} />
        )}
      </Modal>

      {/* Assign member to cell group */}
      <Modal open={assignModal} onClose={() => setAssignModal(false)}
        title={`Assign Members — ${assignTarget?.name || ''}`} size="md">
        {assignTarget && (
          <AssignMemberModal group={assignTarget} api={api}
            onSuccess={() => { fetchData() }}
            onClose={() => setAssignModal(false)} />
        )}
      </Modal>

      {/* Assign member to department */}
      <Modal open={assignDeptModal} onClose={() => { setAssignDeptModal(false); fetchData() }}
        title={`Members — ${assignDeptTarget?.name || ''}`} size="md">
        {assignDeptTarget && (
          <AssignToDepartmentModal dept={assignDeptTarget} api={api}
            onSuccess={() => fetchData()}
            onClose={() => { setAssignDeptModal(false); fetchData() }} />
        )}
      </Modal>

      {/* Confirm delete department */}
      <ConfirmModal open={!!confirmDeleteDept} onClose={() => setConfirmDeleteDept(null)}
        onConfirm={handleDeleteDept} loading={deleting}
        title="Delete Department?"
        message={confirmDeleteDept ? `Delete "${confirmDeleteDept.name}"? This will not delete the members in it.` : ''}
        confirmLabel="Delete" />

      {/* Confirm delete cell group */}
      <ConfirmModal open={!!confirmDeleteGroup} onClose={() => setConfirmDeleteGroup(null)}
        onConfirm={handleDeleteGroup} loading={deleting}
        title="Delete Cell Group?"
        message={confirmDeleteGroup ? `Delete "${confirmDeleteGroup.name}"? Members will be unassigned from this group.` : ''}
        confirmLabel="Delete" />
    </div>
  )
}