import { useState, useEffect, useCallback } from 'react'
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

// Add Palette to your lucide imports:

// ─── TABS ─────────────────────────────────────
const TABS = [
  { id: 'profile',      label: 'Church Profile', icon: Building2 },
  { id: 'team',         label: 'Team Members',   icon: Users     },
  { id: 'security',     label: 'Security',        icon: Lock      },
  { id: 'appearance',   label: 'Appearance',     icon: Palette    },
  { id: 'branches',     label: 'Branches',       icon: GitBranch  },
]

// ─── ROLE BADGE ───────────────────────────────
function RoleBadge({ role }) {
  const map = {
    superadmin:  { label: 'Super Admin',  bg: '#EEF2FF', color: '#4F46E5' },
    pastor:      { label: 'Pastor',       bg: '#D1FAE5', color: '#065F46' },
    admin:       { label: 'Admin',        bg: '#DBEAFE', color: '#1E40AF' },
    treasurer:   { label: 'Treasurer',    bg: '#FEF3C7', color: '#92400E' },
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
function ProfileTab({ token, org, onSaved }) {
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
        {!editing ? (
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
// ─── TEAM MEMBERS TAB ─────────────────────────
function TeamTab({ token }) {
  const [users, setUsers]       = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteForm, setInviteForm] = useState({ 
    name: '', 
    email: '', 
    role: 'admin', 
    password: '',
    branchId: ''
  })
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [successMsg, setSuccessMsg]   = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setUsers(data.users)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  const fetchBranches = useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings/branch-info`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setBranches(data.branchInfo.branches)
      }
    } catch (err) {
      console.error('Failed to fetch branches:', err)
    }
  }, [token])

  useEffect(() => { 
    fetchUsers()
    fetchBranches()
  }, [fetchUsers, fetchBranches])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setInviteError('')

    if (inviteForm.role === 'pastor' && !inviteForm.branchId) {
      setInviteError('Pastors must be assigned to a specific branch.')
      setInviting(false)
      return
    }

    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/settings/users/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(inviteForm)
      })
      const data = await res.json()
      if (!data.success) { setInviteError(data.message); return }
      setShowInvite(false)
      setInviteForm({ name: '', email: '', role: 'admin', password: '', branchId: '' })
      setSuccessMsg(data.message)
      fetchUsers()
      setTimeout(() => setSuccessMsg(''), 4000)
    } catch { setInviteError('Cannot connect to server.') }
    finally { setInviting(false) }
  }

  const handleToggleCrossBranch = async (userId, enabled) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/settings/users/${userId}/cross-branch-access`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ userId, enabled })
        }
      )
      const data = await res.json()
      if (data.success) {
        fetchUsers()
        setSuccessMsg(data.message)
        setTimeout(() => setSuccessMsg(''), 4000)
      } else {
        setInviteError(data.message)
      }
    } catch (err) {
      setInviteError('Failed to update cross-branch access.')
      console.error(err)
    }
  }

  if (loading) return <LoadingSpinner message="Loading team..." />

  return (
    <div className="settings-section">
      <div className="settings-section-header">
        <div>
          <h3 className="settings-section-title">Team Members</h3>
          <p className="settings-section-sub">{users.length} people have access to MinistryOS</p>
        </div>
        <button className="btn-primary" onClick={() => setShowInvite(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> Add Member
        </button>
      </div>

      {successMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-3) var(--space-4)', background: 'var(--success-bg)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--success-text)', marginBottom: 'var(--space-4)' }}>
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      <div className="settings-users-list">
        {users.map(user => (
          <div key={user._id} className="settings-user-row" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto auto auto', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
            <div className="settings-user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="settings-user-info">
              <p className="settings-user-name">{user.name}</p>
              <p className="settings-user-email">{user.email}</p>
            </div>
            <RoleBadge role={user.role} />
            
            {/* Cross-branch read-only toggle */}
            {user.role !== 'superadmin' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={user.crossBranchReadOnly || false}
                  onChange={(e) => handleToggleCrossBranch(user._id, e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                Cross-branch
              </label>
            )}
            
            <p className="settings-user-joined" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(user.createdAt).toLocaleDateString('en-GH', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        ))}
      </div>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Add Team Member" size="md">
        <form onSubmit={handleInvite} className="member-form">
          {inviteError && <div className="form-error">{inviteError}</div>}
          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={inviteForm.name} onChange={e => setInviteForm(p => ({ ...p, name: e.target.value }))}
                className="form-input" placeholder="e.g. Pastor John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                className="form-input" placeholder="john@church.com" required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select value={inviteForm.role} onChange={e => setInviteForm(p => ({ ...p, role: e.target.value }))}
                  className="form-input">
                  <option value="pastor">Pastor</option>
                  <option value="admin">Admin / Secretary</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="cell_leader">Cell Leader</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Temporary Password *</label>
                <input type="password" value={inviteForm.password} onChange={e => setInviteForm(p => ({ ...p, password: e.target.value }))}
                  className="form-input" placeholder="Min. 8 characters" required />
              </div>
            </div>

            {inviteForm.role === 'pastor' && (
              <div className="form-group">
                <label className="form-label">Assigned Branch *</label>
                <select 
                  value={inviteForm.branchId} 
                  onChange={e => setInviteForm(p => ({ ...p, branchId: e.target.value }))}
                  className="form-input"
                  required
                >
                  <option value="">Select a branch...</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                {!inviteForm.branchId && (
                  <p style={{ fontSize: '12px', color: 'var(--danger)', marginTop: '4px' }}>
                    Pastors must be assigned to a branch
                  </p>
                )}
              </div>
            )}

            {inviteForm.role !== 'pastor' && inviteForm.role !== 'member' && (
              <div className="form-group">
                <label className="form-label">Branch (Optional)</label>
                <select 
                  value={inviteForm.branchId} 
                  onChange={e => setInviteForm(p => ({ ...p, branchId: e.target.value }))}
                  className="form-input"
                >
                  <option value="">No specific branch</option>
                  {branches.map(branch => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => setShowInvite(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={inviting}>
              {inviting ? 'Adding...' : 'Add Team Member'}
            </button>
          </div>
        </form>
      </Modal>
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
  const { token, user } = useAuth()
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
        {TABS.map(tab => (
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
  {activeTab === 'profile'      && <ProfileTab      token={token} org={org} onSaved={setOrg} />}
  {activeTab === 'team'         && <TeamTab         token={token} />}
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
