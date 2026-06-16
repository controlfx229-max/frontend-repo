import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import {
  Plus, Users, Search, Edit2, Archive, Eye,
  ChevronDown, ChevronUp, AlertCircle, CheckCircle,
  Download, Upload, Filter
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

// ─── MEMBER FORM ──────────────────────────────
function MemberForm({ api, editing, onSuccess, onClose, departments = [], cellGroups = [] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Extract IDs safely whether the field is a populated object or a raw string/ObjectId
  const deptId = editing?.departmentId?._id || editing?.departmentId || ''
  const groupId = editing?.cellGroupId?._id  || editing?.cellGroupId  || ''

  const [form, setForm] = useState({
    firstName:         editing?.firstName         || '',
    lastName:          editing?.lastName          || '',
    email:             editing?.email             || '',
    phone:             editing?.phone             || '',
    whatsapp:          editing?.whatsapp          || '',
    gender:            editing?.gender            || '',
    dateOfBirth:       editing?.dateOfBirth
      ? new Date(editing.dateOfBirth).toISOString().split('T')[0] : '',
    maritalStatus:     editing?.maritalStatus     || '',
    occupation:        editing?.occupation        || '',
    address:           editing?.address           || '',
    memberStatus:      editing?.memberStatus      || 'active',
    departmentId:      String(deptId),
    cellGroupId:       String(groupId),
    baptized:          editing?.baptized          || false,
    baptismDate:       editing?.baptismDate
      ? new Date(editing.baptismDate).toISOString().split('T')[0] : '',
    nextOfKinName:     editing?.nextOfKinName     || '',
    nextOfKinPhone:    editing?.nextOfKinPhone    || '',
    nextOfKinRelation: editing?.nextOfKinRelation || '',
  })

  // Filter cell groups to the chosen department
  const filteredGroups = form.departmentId
    ? cellGroups.filter(g =>
        (g.departmentId?._id || g.departmentId) === form.departmentId
      )
    : cellGroups

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const next = { ...form, [name]: type === 'checkbox' ? checked : value }
    // If department changed, clear cell group so stale group isn't sent
    if (name === 'departmentId') next.cellGroupId = ''
    setForm(next)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.phone.trim()) {
      setError('First name and phone number are required.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        dateOfBirth:  form.dateOfBirth  ? new Date(form.dateOfBirth)  : null,
        baptismDate:  form.baptismDate  ? new Date(form.baptismDate)  : null,
        departmentId: form.departmentId || null,
        cellGroupId:  form.cellGroupId  || null,
      }
      const data = await api(
        editing ? `/members/${editing._id}` : '/members',
        { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }
      )
      if (!data.success) { setError(data.message); return }
      onSuccess(data.member)
    } catch (err) {
      setError('Cannot connect to server.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="member-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <p className="form-section-title">Personal Information</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input name="firstName" value={form.firstName} onChange={handleChange}
              className="form-input" placeholder="First name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input name="lastName" value={form.lastName} onChange={handleChange}
              className="form-input" placeholder="Last name" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="form-input" placeholder="Phone number" required />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange}
              className="form-input" placeholder="WhatsApp number (optional)" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="form-input" placeholder="Email address" />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
              className="form-input" />
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
            <input name="occupation" value={form.occupation} onChange={handleChange}
              className="form-input" placeholder="Occupation" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="form-input" placeholder="Home address" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Church Information</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="memberStatus" value={form.memberStatus} onChange={handleChange} className="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new_convert">New Convert</option>
              <option value="visitor">Visitor</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <select name="departmentId" value={form.departmentId} onChange={handleChange} className="form-input">
              <option value="">No department</option>
              {departments.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Cell Group</label>
            <select name="cellGroupId" value={form.cellGroupId} onChange={handleChange} className="form-input">
              <option value="">No cell group</option>
              {filteredGroups.map(g => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Baptized?</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <input name="baptized" type="checkbox" checked={form.baptized} onChange={handleChange}
                style={{ width: 18, height: 18, cursor: 'pointer' }} />
              <span style={{ fontSize: 'var(--text-sm)' }}>Yes, I am baptized</span>
            </div>
          </div>
          {form.baptized && (
            <div className="form-group">
              <label className="form-label">Baptism Date</label>
              <input name="baptismDate" type="date" value={form.baptismDate} onChange={handleChange}
                className="form-input" />
            </div>
          )}
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Emergency Contact</p>
        <div className="form-group">
          <label className="form-label">Next of Kin Name</label>
          <input name="nextOfKinName" value={form.nextOfKinName} onChange={handleChange}
            className="form-input" placeholder="Name" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Next of Kin Phone</label>
            <input name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange}
              className="form-input" placeholder="Phone number" />
          </div>
          <div className="form-group">
            <label className="form-label">Relationship</label>
            <input name="nextOfKinRelation" value={form.nextOfKinRelation} onChange={handleChange}
              className="form-input" placeholder="e.g. Spouse, Parent" />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (editing ? 'Saving...' : 'Adding...') : (editing ? 'Save Member' : 'Add Member')}
        </button>
      </div>
    </form>
  )
}

// ─── MAIN MEMBERS PAGE ────────────────────────
export default function Members() {
  const { api, branchReady } = useApi()
  const navigate = useNavigate()

  const [members, setMembers]         = useState([])
  const [departments, setDepartments] = useState([])
  const [cellGroups, setCellGroups]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [searchTerm, setSearchTerm]   = useState('')
  const [filterDept, setFilterDept]   = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const [limit]                       = useState(20)
  const [showModal, setShowModal]     = useState(false)
  const [editing, setEditing]         = useState(null)
  const [confirmArchive, setConfirmArchive] = useState(null)
  const [successMsg, setSuccessMsg]   = useState('')

  // Load departments + cell groups once branch is ready
  useEffect(() => {
    if (!branchReady) return
    const loadLookups = async () => {
      try {
        const [dRes, gRes] = await Promise.all([
          api('/departments'),
          api('/departments/cellgroups'),
        ])
        if (dRes.success) setDepartments(dRes.departments)
        if (gRes.success) setCellGroups(gRes.cellGroups)
      } catch (err) {
        console.error('Failed to load lookups:', err)
      }
    }
    loadLookups()
  }, [api, branchReady])

  const fetchMembers = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('limit', limit)
      if (searchTerm)   params.append('search', searchTerm)
      if (filterDept)   params.append('departmentId', filterDept)
      if (filterStatus) params.append('status', filterStatus)

      const data = await api(`/members?${params}`)
      if (data.success) {
        setMembers(data.members)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Failed to fetch members:', err)
    } finally {
      setLoading(false)
    }
  }, [api, branchReady, page, limit, searchTerm, filterDept, filterStatus])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleArchive = async () => {
    try {
      const data = await api(`/members/${confirmArchive._id}`, { method: 'DELETE' })
      if (data.success) {
        setConfirmArchive(null)
        fetchMembers()
        showSuccess('Member archived successfully.')
      }
    } catch (err) {
      console.error('Failed to archive member:', err)
    }
  }

  const handleSuccess = () => {
    setShowModal(false)
    setEditing(null)
    fetchMembers()
    showSuccess(editing ? 'Member updated successfully.' : 'Member added successfully.')
  }

  const STATUS_COLORS = {
    active:      { bg: '#D1FAE5', color: '#065F46' },
    inactive:    { bg: '#FEE2E2', color: '#991B1B' },
    new_convert: { bg: '#DBEAFE', color: '#1E40AF' },
    visitor:     { bg: '#F1F5F9', color: '#475569' },
    transferred: { bg: '#FEF3C7', color: '#92400E' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {successMsg && (
        <div className="success-toast"><CheckCircle size={16} /> {successMsg}</div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-subtitle">{total} total members</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowModal(true) }}>
          <Plus size={16} /> Add Member
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setPage(1) }}
          className="form-input"
          placeholder="Search by name or phone..."
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          value={filterDept}
          onChange={e => { setFilterDept(e.target.value); setPage(1) }}
          className="form-input"
          style={{ minWidth: 150 }}
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="form-input"
          style={{ minWidth: 150 }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="new_convert">New Convert</option>
          <option value="visitor">Visitor</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading members..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          message="Add your first member to get started."
          action={{ label: '+ Add Member', onClick: () => setShowModal(true) }}
        />
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Name', 'Phone', 'Department', 'Cell Group', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: 'var(--space-3)', textAlign: h === 'Actions' ? 'center' : 'left',
                      fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map(member => {
                  const sc = STATUS_COLORS[member.memberStatus] || STATUS_COLORS.active
                  return (
                    <tr key={member._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>
                          {member.firstName} {member.lastName}
                        </strong>
                        <br />
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {member.memberId}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>
                        {member.phone}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        {member.departmentId ? (
                          <span style={{
                            padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                            background: (member.departmentId?.color || '#4F46E5') + '20',
                            color: member.departmentId?.color || '#4F46E5',
                            fontWeight: 700, fontSize: 'var(--text-xs)'
                          }}>
                            {member.departmentId.name}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-3)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        {member.cellGroupId?.name || '—'}
                      </td>
                      <td style={{ padding: 'var(--space-3)' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 999,
                          background: sc.bg, color: sc.color,
                          fontSize: 'var(--text-xs)', fontWeight: 700
                        }}>
                          {member.memberStatus?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-3)', textAlign: 'center' }}>
                        <button
                          onClick={() => navigate(`/members/${member._id}`)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', marginRight: 4 }}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => { setEditing(member); setShowModal(true) }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', marginRight: 4 }}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setConfirmArchive(member)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}
                          title="Archive"
                        >
                          <Archive size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-outline">
              Previous
            </button>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Page {page} of {Math.max(1, Math.ceil(total / limit))}
            </span>
            <button onClick={() => setPage(p => (p * limit < total ? p + 1 : p))} disabled={page * limit >= total} className="btn-outline">
              Next
            </button>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); setEditing(null) }}
        title={editing ? 'Edit Member' : 'Add New Member'}
        size="lg"
      >
        <MemberForm
          api={api}
          editing={editing}
          departments={departments}
          cellGroups={cellGroups}
          onSuccess={handleSuccess}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      </Modal>

      <ConfirmModal
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={handleArchive}
        title="Archive Member?"
        message={confirmArchive
          ? `Archive ${confirmArchive.firstName} ${confirmArchive.lastName}? Their data will be retained.`
          : ''}
        confirmLabel="Archive"
      />
    </div>
  )
}