import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import useApi from '../../hooks/useApi'
import {
  UserPlus, Search, Phone, Calendar,
  MoreVertical, ChevronLeft, ChevronRight,
  Edit2, CheckCircle, Trash2, X
} from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'


// ─── MEMBER FORM (Add + Edit) ────────────────
function MemberForm({ onSuccess, onClose, api, editing }) {
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [showEdit, setShowEdit] = useState(false)
  const [departments, setDepts]     = useState([])
  const [cellGroups, setCellGroups] = useState([])
  const [filteredGroups, setFilteredGroups] = useState([])
  const [form, setForm] = useState({
    firstName:         editing?.firstName         || '',
    lastName:          editing?.lastName          || '',
    phone:             editing?.phone             || '',
    whatsapp:          editing?.whatsapp          || '',
    email:             editing?.email             || '',
    gender:            editing?.gender            || '',
    dateOfBirth:       editing?.dateOfBirth
      ? new Date(editing.dateOfBirth).toISOString().split('T')[0] : '',
    maritalStatus:     editing?.maritalStatus     || '',
    occupation:        editing?.occupation        || '',
    address:           editing?.address           || '',
    memberStatus:      editing?.memberStatus      || 'active',
    baptized:          editing?.baptized          || false,
    departmentId:      editing?.departmentId?._id || editing?.departmentId || '',
    cellGroupId:       editing?.cellGroupId?._id  || editing?.cellGroupId  || '',
    nextOfKinName:     editing?.nextOfKinName     || '',
    nextOfKinPhone:    editing?.nextOfKinPhone    || '',
    nextOfKinRelation: editing?.nextOfKinRelation || ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dData, gData] = await Promise.all([
          api('/departments'),
          api('/departments/cellgroups')
        ])
        if (dData.success) setDepts(dData.departments)
        if (gData.success) {
          setCellGroups(gData.cellGroups)
          filterGroups(gData.cellGroups, form.departmentId)
        }
      } catch (err) { console.error(err) }
    }
    fetchData()
  }, [api])

  function filterGroups(groups, deptId) {
    if (!deptId) setFilteredGroups(groups)
    else setFilteredGroups(groups.filter(g => !g.departmentId || g.departmentId?._id === deptId || g.departmentId === deptId))
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name === 'departmentId') {
      setForm(prev => ({ ...prev, departmentId: value, cellGroupId: '' }))
      filterGroups(cellGroups, value)
    } else {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) { setError('First name, last name and phone are required.'); return }
    setLoading(true)
    try {
      const payload = { ...form }
      if (!payload.departmentId) payload.departmentId = null
      if (!payload.cellGroupId)  payload.cellGroupId  = null
      
      const data = await api(
        editing ? `/members/${editing._id}` : '/members',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      )
      if (!data.success) { setError(data.message); return }
      onSuccess(data.member)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <p className="form-section-title">Personal Information</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="form-input" placeholder="e.g. Kofi" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="form-input" placeholder="e.g. Mensah" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="form-input" placeholder="024XXXXXXX" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="form-input" placeholder="If different from phone" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Marital Status</label>
            <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="form-input">
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input name="occupation" value={form.occupation} onChange={handleChange} className="form-input" placeholder="e.g. Teacher, Engineer" />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="form-input" placeholder="e.g. Accra, Ghana" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Church Assignment</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Member Status</label>
            <select name="memberStatus" value={form.memberStatus} onChange={handleChange} className="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new_convert">New Convert</option>
              <option value="visitor">Visitor</option>
            </select>
          </div>
          <div className="form-group form-group-checkbox">
            <label className="form-label">Baptized?</label>
            <label className="checkbox-label">
              <input name="baptized" type="checkbox" checked={form.baptized} onChange={handleChange} />
              <span>Yes, baptized</span>
            </label>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Department</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="form-input">
              <option value="">No department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cell Group</label>
            <select name="cellGroupId" value={form.cellGroupId} onChange={handleChange} className="form-input">
              <option value="">No cell group</option>
              {filteredGroups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Emergency Contact</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Next of Kin Name</label>
            <input name="nextOfKinName" value={form.nextOfKinName} onChange={handleChange} className="form-input" placeholder="Full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <input name="nextOfKinRelation" value={form.nextOfKinRelation} onChange={handleChange} className="form-input" placeholder="e.g. Spouse, Parent" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Next of Kin Phone</label>
          <input name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange} className="form-input" placeholder="024XXXXXXX" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Save Changes' : 'Add Member')}
        </button>
      </div>
    </form>
  )
}

// ─── MEMBER PROFILE VIEW ─────────────────────
function MemberProfileView({ member, onEdit, onArchive, onRemoveFromGroup }) {
  const details = [
    { label: 'Phone',       value: member.phone },
    { label: 'WhatsApp',    value: member.whatsapp            || '—' },
    { label: 'Email',       value: member.email               || '—' },
    { label: 'Gender',      value: member.gender              || '—' },
    { label: 'Occupation',  value: member.occupation          || '—' },
    { label: 'Address',     value: member.address             || '—' },
    { label: 'Department',  value: member.departmentId?.name  || '—' },
    { label: 'Cell Group',  value: member.cellGroupId?.name   || '—', removable: !!member.cellGroupId },
    { label: 'Baptized',    value: member.baptized ? 'Yes' : 'No' },
    { label: 'Next of Kin', value: member.nextOfKinName       || '—' },
    { label: 'NOK Phone',   value: member.nextOfKinPhone      || '—' },
  ]

  return (
    <div className="member-profile-preview">
      <div className="profile-preview-header">
        <div className="profile-preview-avatar">
          {member.firstName[0]}{member.lastName[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="profile-preview-name">{member.firstName} {member.lastName}</h2>
          <p className="profile-preview-id">{member.memberId}</p>
          <Badge status={member.memberStatus} />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
          <button className="btn-outline" onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="btn-danger" onClick={onArchive} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={14} /> Archive
          </button>
        </div>
      </div>

      <div className="profile-preview-details">
        {details.map(({ label, value, removable }) => (
          <div className="profile-detail-row" key={label}>
            <span className="profile-detail-label">{label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="profile-detail-value">{value}</span>
              {removable && (
                <button
                  onClick={() => onRemoveFromGroup(member)}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'var(--weight-semibold)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MEMBER ROW (Desktop) ────────────────────
function MemberRow({ member, onView }) {
  const initials   = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
  const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  return (
    <tr className="member-row" onClick={() => onView(member)}>
      <td>
        <div className="member-cell-identity">
          <div className="member-avatar">{initials}</div>
          <div>
            <p className="member-name">{member.firstName} {member.lastName}</p>
            <p className="member-id">{member.memberId}</p>
          </div>
        </div>
      </td>
      <td><div className="member-cell-phone"><Phone size={13} color="var(--text-muted)" /><span>{member.phone}</span></div></td>
      <td><span>{member.gender ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : '—'}</span></td>
      <td><Badge status={member.memberStatus} /></td>
      <td><div className="member-cell-date"><Calendar size={13} color="var(--text-muted)" /><span>{formatDate(member.joinDate)}</span></div></td>
      <td onClick={e => e.stopPropagation()}><button className="member-action-btn"><MoreVertical size={16} /></button></td>
    </tr>
  )
}

// ─── MEMBER CARD (Mobile) ────────────────────
function MemberCard({ member, onView }) {
  const initials = `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
  return (
    <div className="member-card" onClick={() => onView(member)}>
      <div className="member-card-left">
        <div className="member-avatar">{initials}</div>
        <div>
          <p className="member-name">{member.firstName} {member.lastName}</p>
          <p className="member-id">{member.memberId}</p>
          <p className="member-card-phone">{member.phone}</p>
        </div>
      </div>
      <Badge status={member.memberStatus} />
    </div>
  )
}

// ─── MAIN MEMBERS PAGE ───────────────────────
export default function Members() {
  const { api, branchReady } = useApi()
  const navigate = useNavigate()
  const [members, setMembers]               = useState([])
  const [total, setTotal]                   = useState(0)
  const [loading, setLoading]               = useState(true)
  const [showAddModal, setShowAddModal]     = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [editingMember, setEditingMember]   = useState(null)
  const [successMsg, setSuccessMsg]         = useState('')
  const [confirmArchive, setConfirmArchive] = useState(null)
  const [confirmRemove, setConfirmRemove]   = useState(null)
  const [archiving, setArchiving]           = useState(false)
  const [removing, setRemoving]             = useState(false)
  const [isMobile, setIsMobile]             = useState(window.innerWidth < 768)
  const [search, setSearch]                 = useState('')
  const [status, setStatus]                 = useState('')
  const [gender, setGender]                 = useState('')
  const [page, setPage]                     = useState(1)
  const limit = 10

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchMembers = useCallback(async () => {
    if (!branchReady) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(gender && { gender })
      })

      const data = await api(`/members?${params}`)
      if (data.success) { setMembers(data.members); setTotal(data.total) }
    } catch (err) { console.error('❌ Failed to fetch members:', err) }
    finally { setLoading(false) }
  }, [api, branchReady, page, search, status, gender])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMembers() }, [fetchMembers])
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1) }, [search, status, gender, branchReady])

  const showSuccess = (msg) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(''), 4000) }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    fetchMembers()
    showSuccess('Member added successfully.')
  }

  const handleEditSuccess = (updated) => {
    setEditingMember(null)
    setSelectedMember(updated)
    fetchMembers()
    showSuccess('Member updated successfully.')
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      await api(`/members/${confirmArchive._id}`, { method: 'DELETE' })
      setConfirmArchive(null)
      setSelectedMember(null)
      fetchMembers()
      showSuccess('Member archived successfully.')
    } catch {}
    finally { setArchiving(false) }
  }

  const handleRemoveFromGroup = async () => {
    setRemoving(true)
    try {
      const data = await api(`/members/${confirmRemove._id}`, {
        method: 'PUT',
        body: JSON.stringify({ cellGroupId: null })
      })
      if (data.success) {
        setSelectedMember(data.member)
        setConfirmRemove(null)
        fetchMembers()
        showSuccess('Member removed from cell group.')
      }
    } catch {}
    finally { setRemoving(false) }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="members-page">

      {successMsg && (
        <div className="success-toast animate-slideUp">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{total} {total === 1 ? 'member' : 'members'} in your church</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <UserPlus size={16} /> Add Member
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search by name, phone or ID..." value={search}
            onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="filter-selects">
          <select value={status} onChange={e => setStatus(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new_convert">New Convert</option>
            <option value="visitor">Visitor</option>
          </select>
          <select value={gender} onChange={e => setGender(e.target.value)} className="filter-select">
            <option value="">All Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="members-content">
        {loading ? <LoadingSpinner message="Loading members..." /> :
         members.length === 0 ? (
          <EmptyState title="No members found"
            message={search ? `No results for "${search}".` : "Add your first member to get started."}
            action={{ label: '+ Add Member', onClick: () => setShowAddModal(true) }} />
        ) : isMobile ? (
          <div className="member-cards-list">
           {members.map(m => (
  <MemberCard
    key={m._id}
    member={m}
    onView={() => navigate(`/members/${m._id}`)}
  />
))}
          </div>
        ) : (
          <div className="table-wrap">
            <table className="members-table">
              <thead>
                <tr><th>Member</th><th>Phone</th><th>Gender</th><th>Status</th><th>Joined</th><th></th></tr>
              </thead>
              <tbody>
              {members.map(m => (
  <MemberRow
    key={m._id}
    member={m}
    onView={() => navigate(`/members/${m._id}`)}
  />
))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </button>
            <span className="page-info">Page {page} of {totalPages}</span>
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Member" size="lg">
        <MemberForm api={api} onSuccess={handleAddSuccess} onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Member Profile Modal */}
      <Modal open={!!selectedMember && !editingMember} onClose={() => setSelectedMember(null)} title="Member Profile" size="md">
        {selectedMember && (
          <MemberProfileView
            member={selectedMember}
            onEdit={() => setEditingMember(selectedMember)}
            onArchive={() => setConfirmArchive(selectedMember)}
            onRemoveFromGroup={() => setConfirmRemove(selectedMember)}
          />
        )}
      </Modal>

      {/* Edit Member Modal */}
      <Modal open={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Member" size="lg">
        {editingMember && (
          <MemberForm api={api} editing={editingMember} onSuccess={handleEditSuccess} onClose={() => setEditingMember(null)} />
        )}
      </Modal>

      {/* Confirm Archive */}
      <ConfirmModal
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={handleArchive}
        loading={archiving}
        title="Archive Member?"
        message={confirmArchive ? `Archive ${confirmArchive.firstName} ${confirmArchive.lastName}? They won't appear in lists but all data is preserved.` : ''}
        confirmLabel="Archive Member"
      />

      {/* Confirm Remove from Group */}
      <ConfirmModal
        open={!!confirmRemove}
        onClose={() => setConfirmRemove(null)}
        onConfirm={handleRemoveFromGroup}
        loading={removing}
        title="Remove from Cell Group?"
        message={confirmRemove ? `Remove ${confirmRemove.firstName} ${confirmRemove.lastName} from their cell group? They will remain a church member.` : ''}
        confirmLabel="Remove"
      />
    </div>
  )
}