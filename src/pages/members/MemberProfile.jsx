import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useApi from '../../hooks/useApi'
import {
  ArrowLeft, Edit2, MessageSquare, Phone,
  Mail, MapPin, Calendar, Users,
  Wallet, CalendarCheck, Building2, Heart
} from 'lucide-react'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

// ─── HELPERS ─────────────────────────────────
const formatDate = (date) => date
  ? new Date(date).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })
  : '—'

const formatGHS = (v) =>
  `GHS ${parseFloat(v || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`

const timeAgo = (date) => {
  if (!date) return 'Never'
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)   return `${days} days ago`
  if (days < 30)  return `${Math.floor(days / 7)} weeks ago`
  return formatDate(date)
}

const getAvatarColor = (name = '') => {
  const colors = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0F766E']
  const hash   = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

const STATUS_STYLES = {
  active:      { bg: '#D1FAE5', color: '#065F46', label: 'Active'      },
  inactive:    { bg: '#FEF3C7', color: '#92400E', label: 'Inactive'    },
  new_convert: { bg: '#DBEAFE', color: '#1E40AF', label: 'New Convert' },
  visitor:     { bg: '#F1F5F9', color: '#475569', label: 'Visitor'     },
  transferred: { bg: '#FEE2E2', color: '#991B1B', label: 'Transferred' },
}

const OFFERING_LABELS = {
  tithe:          'Tithe',
  offering:       'General Offering',
  thanksgiving:   'Thanksgiving',
  building_fund:  'Building Fund',
  pledge_payment: 'Pledge Payment',
  special_seed:   'Special Seed',
  welfare:        'Welfare'
}

const ATTENDANCE_STATUS = {
  present: { label: 'Present', color: '#059669', bg: '#D1FAE5' },
  absent:  { label: 'Absent',  color: '#DC2626', bg: '#FEE2E2' },
  excused: { label: 'Excused', color: '#2563EB', bg: '#DBEAFE' },
  late:    { label: 'Late',    color: '#D97706', bg: '#FEF3C7' },
  visitor: { label: 'Visitor', color: '#7C3AED', bg: '#EDE9FE' },
}

// ─── DETAIL ROW ───────────────────────────────
function DetailRow({ label, value, icon: Icon }) {
  if (!value || value === '—') return null
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      justifyContent: 'space-between', gap: 'var(--space-4)',
      padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
        {Icon && <Icon size={13} color="var(--text-muted)" />}
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600, textAlign: 'right' }}>
        {value}
      </span>
    </div>
  )
}

// ─── SECTION CARD ─────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <p style={{
        fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-3)',
        borderBottom: '1px solid var(--border)'
      }}>
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── MINI STAT ────────────────────────────────
function MiniStat({ label, value, color = 'var(--primary)' }) {
  return (
    <div style={{
      flex: 1, padding: 'var(--space-4)',
      background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)', textAlign: 'center'
    }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{label}</p>
    </div>
  )
}

// ─── EDIT MEMBER MODAL ────────────────────────
function EditMemberModal({ member, api, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  
  const [form, setForm] = useState({
    firstName:         member.firstName         || '',
    lastName:          member.lastName          || '',
    phone:             member.phone             || '',
    whatsapp:          member.whatsapp          || '',
    email:             member.email             || '',
    gender:            member.gender            || '',
    dateOfBirth:       member.dateOfBirth
      ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
    maritalStatus:     member.maritalStatus     || '',
    occupation:        member.occupation        || '',
    address:           member.address           || '',
    memberStatus:      member.memberStatus      || 'active',
    baptized:          member.baptized          || false,
    baptismDate:       member.baptismDate
      ? new Date(member.baptismDate).toISOString().split('T')[0] : '',
    nextOfKinName:     member.nextOfKinName     || '',
    nextOfKinPhone:    member.nextOfKinPhone    || '',
    nextOfKinRelation: member.nextOfKinRelation || '',
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are required.')
      return
    }
    setLoading(true)
    try {
      const data = await api(`/members/${member._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
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
            <input name="firstName" value={form.firstName} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp</label>
            <input name="whatsapp" value={form.whatsapp} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input name="occupation" value={form.occupation} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="form-input">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Marital Status</label>
            <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="form-input">
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Member Status</label>
            <select name="memberStatus" value={form.memberStatus} onChange={handleChange} className="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new_convert">New Convert</option>
              <option value="visitor">Visitor</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input name="address" value={form.address} onChange={handleChange} className="form-input" />
        </div>
      </div>

      <div className="form-section">
        <p className="form-section-title">Church Information</p>
        <div className="form-group form-group-checkbox">
          <label className="checkbox-label">
            <input name="baptized" type="checkbox" checked={form.baptized} onChange={handleChange} />
            <span>Baptized</span>
          </label>
        </div>
        {form.baptized && (
          <div className="form-group">
            <label className="form-label">Baptism Date</label>
            <input name="baptismDate" type="date" value={form.baptismDate} onChange={handleChange} className="form-input" />
          </div>
        )}
      </div>

      <div className="form-section">
        <p className="form-section-title">Emergency Contact</p>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Name</label>
            <input name="nextOfKinName" value={form.nextOfKinName} onChange={handleChange} className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input name="nextOfKinPhone" value={form.nextOfKinPhone} onChange={handleChange} className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Relationship</label>
          <input name="nextOfKinRelation" value={form.nextOfKinRelation} onChange={handleChange}
            className="form-input" placeholder="e.g. Spouse, Parent, Sibling" />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ─── OVERVIEW TAB ─────────────────────────────
function OverviewTab({ member }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <SectionCard title="Personal Information">
        <DetailRow label="Phone"          value={member.phone}      icon={Phone}    />
        <DetailRow label="WhatsApp"       value={member.whatsapp}   icon={Phone}    />
        <DetailRow label="Email"          value={member.email}      icon={Mail}     />
        <DetailRow label="Gender"         value={member.gender
          ? member.gender.charAt(0).toUpperCase() + member.gender.slice(1) : null} />
        <DetailRow label="Date of Birth"  value={formatDate(member.dateOfBirth)} icon={Calendar} />
        <DetailRow label="Marital Status" value={member.maritalStatus
          ? member.maritalStatus.charAt(0).toUpperCase() + member.maritalStatus.slice(1) : null} />
        <DetailRow label="Occupation"     value={member.occupation} />
        <DetailRow label="Address"        value={member.address}    icon={MapPin}   />
      </SectionCard>

      <SectionCard title="Church Information">
        <DetailRow label="Member ID"   value={member.memberId}           />
        <DetailRow label="Join Date"   value={formatDate(member.joinDate)} icon={Calendar}  />
        <DetailRow label="Department"  value={member.departmentId?.name}  icon={Building2} />
        <DetailRow label="Cell Group"  value={member.cellGroupId?.name}   icon={Users}     />
        <DetailRow label="Baptized"    value={member.baptized
          ? `Yes${member.baptismDate ? ` — ${formatDate(member.baptismDate)}` : ''}` : 'No'} />
        <DetailRow label="Added By"    value={member.addedBy?.name}       />
      </SectionCard>

      {(member.nextOfKinName || member.nextOfKinPhone) && (
        <SectionCard title="Emergency Contact">
          <DetailRow label="Name"         value={member.nextOfKinName}     icon={Heart} />
          <DetailRow label="Phone"        value={member.nextOfKinPhone}    icon={Phone} />
          <DetailRow label="Relationship" value={member.nextOfKinRelation} />
        </SectionCard>
      )}
    </div>
  )
}

// ─── ATTENDANCE TAB ───────────────────────────
function AttendanceTab({ memberId, api }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`/members/${memberId}/attendance`)
        if (data.success) setData(data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [memberId, api])

  if (loading) return <LoadingSpinner message="Loading attendance..." />

  const stats     = data?.stats || {}
  const rateColor = stats.rate >= 75
    ? 'var(--success)' : stats.rate >= 50
    ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <MiniStat label="Attendance Rate" value={`${stats.rate || 0}%`}      color={rateColor}        />
        <MiniStat label="Total Attended"  value={stats.totalAttended || 0}   color="var(--primary)"   />
        <MiniStat label="Last Attended"   value={timeAgo(stats.lastAttended)} color="var(--info)"     />
      </div>

      {/* Rate bar */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            Consistency
          </span>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: rateColor }}>
            {stats.rate || 0}%
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 999 }}>
          <div style={{
            height: '100%', width: `${stats.rate || 0}%`,
            background: rateColor, borderRadius: 999, transition: 'width 1s ease'
          }} />
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          {stats.totalAttended} present out of {stats.totalRecords} recorded services
        </p>
      </div>

      {/* Service records */}
      {data?.serviceRecords?.length > 0 && (
        <SectionCard title="Service Attendance History">
          {data.serviceRecords.map((r, i) => {
            const st = ATTENDANCE_STATUS[r.status] || ATTENDANCE_STATUS.absent
            return (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) 0',
                borderBottom: i < data.serviceRecords.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {r.serviceId?.name || 'Service'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatDate(r.serviceId?.date)}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 999, background: st.bg, color: st.color
                }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </SectionCard>
      )}

      {/* Event records */}
      {data?.eventRecords?.length > 0 && (
        <SectionCard title="Event Attendance History">
          {data.eventRecords.map((r, i) => {
            const st = ATTENDANCE_STATUS[r.status] || ATTENDANCE_STATUS.absent
            return (
              <div key={r._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: 'var(--space-3) 0',
                borderBottom: i < data.eventRecords.length - 1 ? '1px solid var(--border)' : 'none'
              }}>
                <div>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {r.eventId?.title || 'Event'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatDate(r.eventId?.startDate)}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px',
                  borderRadius: 999, background: st.bg, color: st.color
                }}>
                  {st.label}
                </span>
              </div>
            )
          })}
        </SectionCard>
      )}

      {!data?.serviceRecords?.length && !data?.eventRecords?.length && (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
          <CalendarCheck size={32} style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)' }}>No attendance records yet.</p>
        </div>
      )}
    </div>
  )
}

// ─── GIVING TAB ───────────────────────────────
function GivingTab({ memberId, api }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api(`/finance/member/${memberId}`)
        if (data.success) setData(data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [memberId, api])

  if (loading) return <LoadingSpinner message="Loading giving history..." />

  const offerings  = data?.offerings || []
  const totalGHS   = parseFloat(data?.totalGHS || 0)
  const now        = new Date()

  const yearTotal  = offerings
    .filter(o => new Date(o.date).getFullYear() === now.getFullYear())
    .reduce((sum, o) => sum + (o.amount / 100), 0)

  const monthTotal = offerings
    .filter(o => {
      const d = new Date(o.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, o) => sum + (o.amount / 100), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <MiniStat label="Total (All Time)" value={formatGHS(totalGHS)}   color="var(--success)" />
        <MiniStat label="This Year"        value={formatGHS(yearTotal)}  color="var(--primary)" />
        <MiniStat label="This Month"       value={formatGHS(monthTotal)} color="var(--info)"    />
      </div>

      {offerings.length > 0 ? (
        <SectionCard title={`Giving History (${offerings.length} transactions)`}>
          {offerings.slice(0, 15).map((o, i) => (
            <div key={o._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--space-3) 0',
              borderBottom: i < Math.min(offerings.length, 15) - 1 ? '1px solid var(--border)' : 'none'
            }}>
              <div>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {OFFERING_LABELS[o.offeringType] || o.offeringType}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {formatDate(o.date)} · {o.paymentMethod?.replace('_', ' ')}
                </p>
              </div>
              <p style={{
                fontFamily: 'var(--font-heading)', fontSize: 'var(--text-base)',
                fontWeight: 700, color: 'var(--success)'
              }}>
                {formatGHS(o.amount / 100)}
              </p>
            </div>
          ))}
        </SectionCard>
      ) : (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
          <Wallet size={32} style={{ margin: '0 auto var(--space-3)' }} />
          <p style={{ fontSize: 'var(--text-sm)' }}>No giving records yet.</p>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PROFILE PAGE ────────────────────────
export default function MemberProfile() {
  const { id }    = useParams()
  const { api, branchReady } = useApi()
  const navigate  = useNavigate()

  const [member, setMember]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEdit, setShowEdit] = useState(false)


  useEffect(() => {
    if (!branchReady) return
    const load = async () => {
      try {
        const data = await api(`/members/${id}`)
        if (data.success) setMember(data.member)
        else navigate('/members')
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [id, api, branchReady, navigate])

  if (loading) return <LoadingSpinner message="Loading profile..." />
  if (!member)  return null

  const avatarColor = getAvatarColor(member.firstName + member.lastName)
  const statusStyle = STATUS_STYLES[member.memberStatus] || STATUS_STYLES.active
  const initials    = `${member.firstName[0]}${member.lastName[0]}`

  // Smart indicators
  const indicators = []
  if (member.dateOfBirth) {
    const dob  = new Date(member.dateOfBirth)
    const now  = new Date()
    const next = new Date(now.getFullYear(), dob.getMonth(), dob.getDate())
    const diff = (next - now) / (1000 * 60 * 60 * 24)
    if (diff >= 0 && diff <= 7)
      indicators.push({ emoji: '🎂', text: 'Birthday this week', bg: '#FCE7F3', color: '#9D174D' })
  }
  if (member.memberStatus === 'inactive')
    indicators.push({ emoji: '⚠️', text: 'Needs follow-up',  bg: '#FEE2E2', color: '#991B1B' })
  if (member.memberStatus === 'new_convert')
    indicators.push({ emoji: '✨', text: 'New convert',       bg: '#DBEAFE', color: '#1E40AF' })
  if (member.baptized)
    indicators.push({ emoji: '✝️', text: 'Baptized',          bg: '#EDE9FE', color: '#6D28D9' })

  const TABS = [
    { id: 'overview',   label: 'Overview',   icon: Users         },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'giving',     label: 'Giving',     icon: Wallet        },
  ]

  const quickActions = [
    { label: 'Call Member',  icon: Phone,         action: () => window.open(`tel:${member.phone}`) },
    { label: 'Send Message', icon: MessageSquare, action: () => navigate('/communications')        },
    { label: 'Edit Profile', icon: Edit2,         action: () => setShowEdit(true)                  },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Back */}
      <button onClick={() => navigate('/members')} style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
        color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600,
        background: 'none', border: 'none', cursor: 'pointer', width: 'fit-content', padding: 'var(--space-2) 0'
      }}>
        <ArrowLeft size={16} /> Back to Members
      </button>

      {/* Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>

        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Profile card */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)', textAlign: 'center'
          }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: avatarColor, color: 'white',
              fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-4)'
            }}>
              {initials}
            </div>

            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)',
              fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)'
            }}>
              {member.firstName} {member.lastName}
            </h2>

            <span style={{
              fontSize: 11, fontWeight: 700, padding: '3px 12px',
              borderRadius: 999, background: statusStyle.bg, color: statusStyle.color
            }}>
              {statusStyle.label}
            </span>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              {member.memberId}
            </p>

            {member.departmentId && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Building2 size={12} /> {member.departmentId.name}
              </div>
            )}
            {member.cellGroupId && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                <Users size={12} /> {member.cellGroupId.name}
              </div>
            )}

            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>
              Member since {new Date(member.joinDate || member.createdAt)
                .toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Smart indicators */}
          {indicators.length > 0 && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)'
            }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
                Indicators
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {indicators.map((ind, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    background: ind.bg, color: ind.color,
                    fontSize: 'var(--text-xs)', fontWeight: 700
                  }}>
                    <span>{ind.emoji}</span><span>{ind.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', boxShadow: 'var(--shadow-sm)'
          }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
              Quick Actions
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {quickActions.map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={action} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                  padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)', background: 'var(--surface)',
                  color: 'var(--text-secondary)', fontSize: 'var(--text-sm)',
                  fontWeight: 600, cursor: 'pointer', width: '100%', textAlign: 'left',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)';   e.currentTarget.style.color = 'var(--text-secondary)' }}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="settings-tabs">
            {TABS.map(tab => (
              <button key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}>
                <tab.icon size={15} /><span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'overview'   && <OverviewTab   member={member} />}
          {activeTab === 'attendance' && <AttendanceTab memberId={id} api={api} />}
          {activeTab === 'giving'     && <GivingTab     memberId={id} api={api} />}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Member" size="lg">
        <EditMemberModal
          member={member}
          api={api}
          onSuccess={(updated) => { setMember(updated); setShowEdit(false) }}
          onClose={() => setShowEdit(false)}
        />
      </Modal>
    </div>
  )
}