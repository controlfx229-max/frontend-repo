import { useState, useEffect, useCallback } from 'react'
import {
  GitBranch, Plus, Edit2, Trash2,
  Users, MapPin, Phone, Mail,
  CheckCircle, AlertTriangle, CreditCard,
  Shield, Star
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Modal from '../../components/ui/Modal'
import ConfirmModal from '../../components/ui/ConfirmModal'
import { useBranch } from '../../context/BranchContext'

const WHATSAPP_NUMBER = '233553951396' // ← Replace with your real number

// ─── BRANCH FORM ──────────────────────────────
function BranchForm({ token, branch, onSuccess, onClose }) {
  const isEdit = !!branch
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    name:        branch?.name        || '',
    address:     branch?.address     || '',
    city:        branch?.city        || '',
    phone:       branch?.phone       || '',
    email:       branch?.email       || '',
    description: branch?.description || ''
  })

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Branch name is required.'); return }
    setLoading(true)
    try {
      const url    = isEdit
        ? `${import.meta.env.VITE_API_URL}/branches/${branch._id}`
        : `${import.meta.env.VITE_API_URL}/branches`
      const method = isEdit ? 'PUT' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      })
      const data = await res.json()

      if (!data.success) {
        // Billing limit hit
        if (data.limitReached) {
          setError(data.message)
          return
        }
        setError(data.message)
        return
      }
      onSuccess(data.branch, isEdit ? 'updated' : 'created')
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
        <div className="form-group">
          <label className="form-label">Branch Name *</label>
          <input name="name" value={form.name} onChange={handleChange}
            className="form-input" placeholder="e.g. Kumasi Branch" />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input name="city" value={form.city} onChange={handleChange}
              className="form-input" placeholder="e.g. Kumasi" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              className="form-input" placeholder="024XXXXXXX" />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Address</label>
          <input name="address" value={form.address} onChange={handleChange}
            className="form-input" placeholder="Street address" />
        </div>

        <div className="form-group">
          <label className="form-label">Branch Email</label>
          <input name="email" type="email" value={form.email}
            onChange={handleChange} className="form-input"
            placeholder="branch@church.com" />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <input name="description" value={form.description}
            onChange={handleChange} className="form-input"
            placeholder="Optional notes about this branch" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Branch'}
        </button>
      </div>
    </form>
  )
}

function UpgradePrompt({ currentCount, maxBranches }) {
  const navigate = useNavigate()

  return (
    <div style={{
      background: 'var(--warning-bg)',
      border: '1.5px solid #FDE68A',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-full)',
        background: '#FEF3C7', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <AlertTriangle size={26} color="#D97706" />
      </div>

      <div>
        <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
          Branch Limit Reached
        </p>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your current plan includes{' '}
          <strong>{maxBranches} {maxBranches === 1 ? 'branch' : 'branches'}</strong>.
          Additional branches cost <strong>GHS 150/month</strong> each.
          Once payment is confirmed, your new branch will be activated automatically.
        </p>
      </div>

      <button
        className="btn-primary"
        onClick={() => navigate('/billing')}
        style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: '0.75rem var(--space-6)'
        }}
      >
        <CreditCard size={16} />
        Request Additional Branch
      </button>

      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
        Pay via MoMo → submit proof → branch activated within 24 hours.
      </p>
    </div>
  )
}

// ─── BRANCH CARD ──────────────────────────────
function BranchCard({ branch, onEdit, onDelete, canManage }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1.5px solid ${branch.isMain ? 'var(--primary)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)',
      transition: 'box-shadow 0.2s ease'
    }}>
      {/* Top color bar */}
      <div style={{
        height: 4,
        background: branch.isMain ? 'var(--primary)' : 'var(--success)'
      }} />

      <div style={{ padding: 'var(--space-5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{
              width: 40, height: 40,
              borderRadius: 'var(--radius-md)',
              background: branch.isMain ? 'var(--primary-light)' : '#D1FAE5',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {branch.isMain
                ? <Star size={18} color="var(--primary)" />
                : <GitBranch size={18} color="var(--success)" />
              }
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
                  {branch.name}
                </p>
                {branch.isMain && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary)',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    Main
                  </span>
                )}
              </div>
              {branch.description && (
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
                  {branch.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions — only for non-main or if canManage */}
          {canManage && (
            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              <button
                onClick={() => onEdit(branch)}
                style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--border)', background: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                <Edit2 size={13} />
              </button>
              {!branch.isMain && (
                <button
                  onClick={() => onDelete(branch)}
                  style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1.5px solid var(--border)', background: 'none',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {branch.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <MapPin size={12} color="var(--text-muted)" />
              {branch.city}{branch.address ? ` · ${branch.address}` : ''}
            </div>
          )}
          {branch.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <Phone size={12} color="var(--text-muted)" />
              {branch.phone}
            </div>
          )}
          {branch.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <Mail size={12} color="var(--text-muted)" />
              {branch.email}
            </div>
          )}
        </div>

        {/* Member count footer */}
        <div style={{
          marginTop: 'var(--space-4)',
          paddingTop: 'var(--space-3)',
          borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <Users size={13} />
            <span><strong style={{ color: 'var(--text-primary)' }}>{branch.memberCount}</strong> member{branch.memberCount !== 1 ? 's' : ''}</span>
          </div>
          {!branch.isMain && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              +GHS 150/mo
            </span>
          )}
          {branch.isMain && (
            <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle size={11} /> Included in plan
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN BRANCHES TAB ────────────────────────
export default function BranchesTab({ token, userRole }) {
  const [branchInfo, setBranchInfo]   = useState(null)
  const [loading, setLoading]         = useState(true)
  const [showCreate, setShowCreate]   = useState(false)
  const [editTarget, setEditTarget]   = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [successMsg, setSuccessMsg]   = useState('')
  const { fetchBranches }             = useBranch()

  const canManage = ['superadmin', 'pastor'].includes(userRole)

  const fetchBranchInfo = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/branch-info`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setBranchInfo(data.branchInfo)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchBranchInfo() }, [fetchBranchInfo])

  const showSuccess = (msg) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSuccess = async (branch, action) => {
    setShowCreate(false)
    setEditTarget(null)
    await fetchBranchInfo()
    await fetchBranches() // refresh navbar switcher
    showSuccess(`Branch ${action === 'created' ? 'created' : 'updated'} successfully.`)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res  = await fetch(
        `${import.meta.env.VITE_API_URL}/branches/${deleteTarget._id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (!data.success) { showSuccess(data.message); setDeleteTarget(null); return }
      setDeleteTarget(null)
      await fetchBranchInfo()
      await fetchBranches()
      showSuccess('Branch removed successfully.')
    } catch (err) { console.error(err) }
    finally { setDeleting(false) }
  }

  if (loading) return (
    <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />
      <p style={{ fontSize: 'var(--text-sm)' }}>Loading branch information...</p>
    </div>
  )

  if (!branchInfo) return null

  const { branches, totalBranches, maxBranches, canAddMore, extraCost, branchPriceGHS } = branchInfo

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Success Toast */}
      {successMsg && (
        <div className="success-toast" style={{ position: 'relative', top: 'auto', right: 'auto', left: 'auto' }}>
          <CheckCircle size={14} /> {successMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Church Branches
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            {totalBranches} of {maxBranches === 9999 ? 'unlimited' : maxBranches} branch{maxBranches !== 1 ? 'es' : ''} used
            {extraCost > 0 && ` · GHS ${extraCost}/mo for extra branches`}
          </p>
        </div>

        {canManage && canAddMore && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Add Branch
          </button>
        )}
      </div>

      {/* Pricing info banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--primary-light)',
        border: '1px solid var(--primary)',
        borderRadius: 'var(--radius-lg)',
        fontSize: 'var(--text-sm)'
      }}>
        <Shield size={16} color="var(--primary)" />
        <div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            1 branch included
          </span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {' '}in your base subscription · Additional branches at{' '}
          </span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
            GHS {branchPriceGHS}/month each
          </span>
        </div>
      </div>

      {/* Branch Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--space-4)'
      }}>
        {branches.map(branch => (
          <BranchCard
            key={branch._id}
            branch={branch}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
            canManage={canManage}
          />
        ))}
      </div>

      {/* Upgrade prompt when limit reached */}
      {canManage && !canAddMore && (
        <UpgradePrompt
          currentCount={totalBranches}
          maxBranches={maxBranches}
        />
      )}

      {/* Create Branch Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)}
        title="Add New Branch" size="md">
        <BranchForm
          token={token}
          onSuccess={handleSuccess}
          onClose={() => setShowCreate(false)}
        />
      </Modal>

      {/* Edit Branch Modal */}
      <Modal open={!!editTarget} onClose={() => setEditTarget(null)}
        title="Edit Branch" size="md">
        {editTarget && (
          <BranchForm
            token={token}
            branch={editTarget}
            onSuccess={handleSuccess}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Remove Branch?"
        confirmLabel="Remove"
        message={deleteTarget
          ? `Remove "${deleteTarget.name}"? This cannot be undone. Make sure all members are reassigned first.`
          : ''}
      />
    </div>
  )
}