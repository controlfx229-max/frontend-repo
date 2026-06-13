import { useState, useEffect, useCallback,useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  CreditCard, CheckCircle, AlertCircle, Clock,
  MessageCircle, Zap, Users, GitBranch, MessageSquare,
  ArrowRight, Shield, Star, TrendingUp, Plus
} from 'lucide-react'

const WHATSAPP_NUMBER = '233553951396'

const formatGHS = (n) =>
  `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`

// ── PLAN CONFIG ───────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceGHS: 200,
    color: '#4F46E5',
    bg: '#EEF2FF',
    features: ['Up to 200 members', '5 staff accounts', '1 branch', '200 SMS credits/month'],
    icon: Zap,
  },
  {
    id: 'growth',
    name: 'Growth',
    priceGHS: 350,
    color: '#059669',
    bg: '#D1FAE5',
    features: ['Up to 500 members', '15 staff accounts', '2 branches', '500 SMS credits/month'],
    icon: TrendingUp,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceGHS: 500,
    color: '#D97706',
    bg: '#FEF3C7',
    features: ['Unlimited members', 'Unlimited staff', '5 branches', '2,000 SMS credits/month'],
    icon: Star,
  },
]

const SMS_BUNDLES = [
  { key: '500',  credits: 500,  priceGHS: 40  },
  { key: '1000', credits: 1000, priceGHS: 75  },
  { key: '5000', credits: 5000, priceGHS: 320 },
]

// ── STATUS BANNER ─────────────────────────────
function StatusBanner({ billing }) {
  if (!billing) return null
  const { status, daysRemaining, plan, expiresAt, pendingPayment } = billing

  if (pendingPayment && pendingPayment.status === 'pending_approval') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: '#DBEAFE', border: '1px solid #93C5FD',
        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)'
      }}>
        <Clock size={18} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontWeight: 700, color: '#1E40AF', fontSize: 'var(--text-sm)' }}>
            Payment under review
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: '#1E40AF', marginTop: 2 }}>
            Reference <strong>{pendingPayment.reference}</strong> — GHS {pendingPayment.amount} submitted.
            Our team will verify within 24 hours.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'trial') {
    const warn = daysRemaining <= 7
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: warn ? '#FEF3C7' : '#D1FAE5',
        border: `1px solid ${warn ? '#FDE68A' : '#6EE7B7'}`,
        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)'
      }}>
        <AlertCircle size={18} color={warn ? '#92400E' : '#065F46'} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, color: warn ? '#92400E' : '#065F46', fontSize: 'var(--text-sm)' }}>
            {warn
              ? `Trial ending in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
              : `Free trial active — ${daysRemaining} days remaining`}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: warn ? '#92400E' : '#065F46', marginTop: 2 }}>
            {warn
              ? 'Subscribe now to avoid any interruption to your church management.'
              : 'You have full access to all features during your trial period.'}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: '#FEE2E2', border: '1px solid #FECACA',
        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)'
      }}>
        <AlertCircle size={18} color="#991B1B" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontWeight: 700, color: '#991B1B', fontSize: 'var(--text-sm)' }}>
            Subscription expired
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: '#991B1B', marginTop: 2 }}>
            Your data is safe. Subscribe below to restore full access.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: '#D1FAE5', border: '1px solid #6EE7B7',
        borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-6)'
      }}>
        <CheckCircle size={18} color="#065F46" />
        <p style={{ fontWeight: 600, color: '#065F46', fontSize: 'var(--text-sm)' }}>
          {plan.charAt(0).toUpperCase() + plan.slice(1)} plan active — renews{' '}
          {expiresAt
            ? new Date(expiresAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' })
            : '—'}
        </p>
      </div>
    )
  }

  return null
}

// ── USAGE CARD ────────────────────────────────
function UsageCard({ label, current, limit, color, icon: Icon }) {
  const pct  = limit === -1 ? 0 : Math.min((current / limit) * 100, 100)
  const warn = limit !== -1 && pct > 80

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={15} color={color} />
        </div>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
        {current}
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
          / {limit === -1 ? '∞' : limit}
        </span>
      </p>
      {limit !== -1 && (
        <div style={{ marginTop: 'var(--space-2)', height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: warn ? 'var(--warning)' : color, borderRadius: 999, transition: 'width 0.8s ease' }} />
        </div>
      )}
    </div>
  )
}

// ── PAYMENT MODAL ─────────────────────────────
function PaymentModal({ type, plan, smsBundle, branchName, token, onClose, onSuccess }) {
  const [loading,  setLoading]  = useState(false)
  const [creating, setCreating] = useState(true)
  const [payment,  setPayment]  = useState(null)
  const [step,     setStep]     = useState('instructions')
  const [txId,     setTxId]     = useState('')
  const [error,    setError]    = useState('')

// Add this at the top of PaymentModal, with the other useState declarations
const hasCreated = useRef(false)

useEffect(() => {
  // Guard against React Strict Mode double-invoke
  if (hasCreated.current) return
  hasCreated.current = true

  const create = async () => {
    try {
      const body = { type }
      if (type === 'subscription' || type === 'upgrade') body.plan = plan
      if (type === 'sms')    body.smsBundleKey = smsBundle
      if (type === 'branch') body.branchDetails = { branchName }

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/request`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) setPayment(data.payment)
      else setError(data.message)
    } catch { setError('Cannot connect to server.') }
    finally { setCreating(false) }
  }
  create()
}, [])

  const handleSubmitProof = async () => {
    if (!txId.trim()) { setError('Please enter your MoMo transaction ID.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/proof`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ reference: payment.reference, transactionId: txId.trim() })
      })
      const data = await res.json()
      if (data.success) { setStep('done'); onSuccess() }
      else setError(data.message)
    } catch { setError('Cannot connect to server.') }
    finally { setLoading(false) }
  }

  const titles = {
    subscription: 'Subscribe',
    upgrade:      'Upgrade Plan',
    sms:          'Buy SMS Credits',
    branch:       'Request Additional Branch',
  }

  return (
    <div className="modal-overlay">
      <div className="modal modal-md">
        <div className="modal-header">
          <h2 className="modal-title">{titles[type] || 'Payment'}</h2>
          <button className="modal-close" onClick={onClose}><span style={{ fontSize: 18 }}>×</span></button>
        </div>
        <div className="modal-body">
          {step === 'done' ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                <CheckCircle size={32} color="var(--success)" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                Proof submitted!
              </h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                {type === 'branch'
                  ? 'Our team will verify your payment within 24 hours and activate your new branch.'
                  : 'Our team will verify your payment within 24 hours and activate your account.'}
              </p>
              <button className="btn-primary" onClick={onClose}>Done</button>
            </div>
          ) : creating ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div className="spinner" style={{ margin: '0 auto var(--space-4)' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Creating payment request...</p>
            </div>
          ) : error && !payment ? (
            <div>
              <div className="form-error">{error}</div>
              <button className="btn-outline" onClick={onClose} style={{ marginTop: 'var(--space-4)' }}>Close</button>
            </div>
          ) : payment ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {error && <div className="form-error">{error}</div>}

              {/* Amount */}
              <div style={{ background: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>
                  Amount to send
                </p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--primary)' }}>
                  GHS {payment.amount}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                  Ref: <strong style={{ color: 'var(--primary)' }}>{payment.reference}</strong>
                </p>
              </div>

              {/* MoMo instructions */}
              <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
                <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                  MoMo Payment Instructions
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {[
                    ['Send to',      payment.momoNumber],
                    ['Account name', payment.accountName],
                    ['Amount',       `GHS ${payment.amount}`],
                    ['Reference',    payment.reference],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="form-label">Enter MoMo Transaction ID after paying *</label>
                <input
                  className="form-input"
                  value={txId}
                  onChange={e => { setTxId(e.target.value); setError('') }}
                  placeholder="e.g. 6537283819"
                  style={{ marginTop: 'var(--space-2)' }}
                />
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>
                  Found in your MoMo transaction history or SMS confirmation.
                </p>
              </div>

              <div className="form-actions">
                <button className="btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={handleSubmitProof} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Payment Proof'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ── BRANCHES TAB ──────────────────────────────
function BranchesTab({ billing, token, onPayment }) {
  const [branchName, setBranchName] = useState('')
  const [error, setError]           = useState('')

  const handleRequest = () => {
    if (!branchName.trim()) { setError('Please enter a name for the new branch.'); return }
    setError('')
    onPayment('branch', null, null, branchName.trim())
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      {/* Info card */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GitBranch size={22} color="var(--primary)" />
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)' }}>
              Additional Branch
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
              Each additional branch costs GHS 150/month
            </p>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary)' }}>
              GHS 150
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>per branch / month</p>
          </div>
        </div>

        {/* What happens */}
        <div style={{
          background: 'var(--surface-2)', borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)', marginBottom: 'var(--space-5)'
        }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
            How it works
          </p>
          {[
            '1. Enter your new branch name below',
            '2. Pay GHS 150 via MoMo to the number shown',
            '3. Submit your transaction ID as proof',
            '4. We verify and activate your branch within 24 hours',
          ].map(step => (
            <p key={step} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)', lineHeight: 1.5 }}>
              {step}
            </p>
          ))}
        </div>

        {/* Branch name input */}
        <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="form-label">New Branch Name *</label>
          <input
            className="form-input"
            value={branchName}
            onChange={e => { setBranchName(e.target.value); setError('') }}
            placeholder="e.g. Kumasi Branch"
            style={{ marginTop: 'var(--space-2)' }}
          />
          {error && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
        </div>

        <button
          className="btn-primary"
          onClick={handleRequest}
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
        >
          <Plus size={16} /> Request Branch — GHS 150/month
        </button>
      </div>

      {/* Current branches count */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)'
      }}>
        <Shield size={16} color="var(--primary)" />
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          Your <strong>{billing?.plan}</strong> plan includes{' '}
          <strong>{billing?.allowedBranches === -1 ? 'unlimited' : billing?.allowedBranches} branch{billing?.allowedBranches !== 1 ? 'es' : ''}</strong>.
          Additional branches are billed at GHS 150/month each.
        </p>
      </div>
    </div>
  )
}

// ── MAIN BILLING PAGE ─────────────────────────
export default function Billing() {
  const { token } = useAuth()
  const [billing,   setBilling]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchBilling = useCallback(async () => {
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/status`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setBilling(data.billing)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchBilling() }, [fetchBilling])

  // type, plan, smsBundle, branchName
  const openPayment = (type, plan = null, smsBundle = null, branchName = null) => {
    setModal({ type, plan, smsBundle, branchName })
  }

  const currentPlanId = billing?.plan

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
        <p className="spinner-message">Loading billing information...</p>
      </div>
    )
  }

  const TABS = [
    { id: 'overview',  label: 'Overview'    },
    { id: 'plans',     label: 'Plans'       },
    { id: 'branches',  label: 'Branches'    },
    { id: 'sms',       label: 'SMS Credits' },
    { id: 'history',   label: 'History'     },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Subscription</h1>
          <p className="page-subtitle">Manage your MinistryOS plan and payments</p>
        </div>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I need help with my MinistryOS billing.')}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: '0.625rem var(--space-4)',
            background: '#25D366', color: 'white',
            borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: 'var(--text-sm)',
            textDecoration: 'none'
          }}
        >
          <MessageCircle size={15} /> Contact Support
        </a>
      </div>

      {/* Status Banner */}
      <StatusBanner billing={billing} />

      {/* Tabs */}
      <div className="settings-tabs">
        {TABS.map(tab => (
          <button key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && billing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
              <div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)' }}>Current plan</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                  {billing.plan}
                </h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>SMS Credits</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary)' }}>
                  {billing.smsCredits}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
              <UsageCard label="Members"       current={billing.currentMembers} limit={billing.memberLimit}    color="var(--primary)" icon={Users}     />
              <UsageCard label="Staff accounts" current={billing.currentStaff}  limit={billing.staffLimit}     color="var(--success)" icon={Shield}    />
              <UsageCard label="Branches"       current={billing.allowedBranches} limit={billing.allowedBranches} color="var(--warning)" icon={GitBranch} />
            </div>
          </div>

          {(billing.status === 'trial' || billing.status === 'expired') && (
            <div style={{
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)'
            }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: 4 }}>
                  {billing.status === 'trial' ? 'Upgrade to unlock full potential' : 'Renew your subscription'}
                </h3>
                <p style={{ opacity: 0.85, fontSize: 'var(--text-sm)' }}>
                  Starting at GHS 200/month. Pay via MoMo — activated within 24 hours.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('plans')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                  padding: '0.75rem var(--space-5)',
                  background: 'white', color: 'var(--primary)',
                  borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)',
                  border: 'none', cursor: 'pointer', flexShrink: 0
                }}
              >
                View Plans <ArrowRight size={15} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PLANS ── */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {PLANS.map(plan => {
              const isCurrent = currentPlanId === plan.id
              const isUpgrade = PLANS.findIndex(p => p.id === currentPlanId) < PLANS.findIndex(p => p.id === plan.id)
              const PlanIcon  = plan.icon

              return (
                <div key={plan.id} style={{
                  background: 'var(--surface)',
                  border: `2px solid ${isCurrent ? plan.color : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)', padding: 'var(--space-6)',
                  boxShadow: 'var(--shadow-sm)', position: 'relative',
                  display: 'flex', flexDirection: 'column'
                }}>
                  {plan.popular && !isCurrent && (
                    <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      Most Popular
                    </span>
                  )}
                  {isCurrent && (
                    <span style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.color, color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>
                      Current Plan
                    </span>
                  )}

                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: plan.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                    <PlanIcon size={20} color={plan.color} />
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>{plan.name}</h3>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: plan.color, marginBottom: 'var(--space-4)' }}>
                    GHS {plan.priceGHS}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
                  </p>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', flex: 1, marginBottom: 'var(--space-5)' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        <CheckCircle size={14} color={plan.color} style={{ flexShrink: 0 }} /> {f}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button disabled style={{ width: '100%', padding: '0.625rem', border: `1.5px solid ${plan.color}`, borderRadius: 'var(--radius-md)', background: plan.bg, color: plan.color, fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'not-allowed', opacity: 0.8 }}>
                      Current Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const type = billing?.status === 'active' ? 'upgrade' : 'subscription'
                        openPayment(type, plan.id)
                      }}
                      style={{ width: '100%', padding: '0.625rem', background: plan.color, color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {billing?.status === 'active' && isUpgrade ? `Upgrade to ${plan.name}` : `Subscribe — GHS ${plan.priceGHS}/mo`}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4) var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <MessageCircle size={16} color="#25D366" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              Need help choosing?{' '}
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>
                Chat with us on WhatsApp
              </a>
            </p>
          </div>
        </div>
      )}

      {/* ── BRANCHES ── */}
      {activeTab === 'branches' && (
        <BranchesTab
          billing={billing}
          token={token}
          onPayment={openPayment}
        />
      )}

      {/* ── SMS CREDITS ── */}
      {activeTab === 'sms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-5)', boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={24} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Current SMS credits</p>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--primary)' }}>
                {billing?.smsCredits || 0}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
            {SMS_BUNDLES.map(bundle => (
              <div key={bundle.key} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <MessageSquare size={16} color="var(--primary)" />
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {bundle.credits.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>credits</span>
                </div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--primary)' }}>
                  GHS {bundle.priceGHS}
                </p>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  ~GHS {(bundle.priceGHS / bundle.credits).toFixed(3)} per SMS
                </p>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  onClick={() => openPayment('sms', null, bundle.key)}
                >
                  Buy Bundle
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {activeTab === 'history' && <PaymentHistory token={token} />}

      {/* Payment Modal */}
      {modal && (
        <PaymentModal
          type={modal.type}
          plan={modal.plan}
          smsBundle={modal.smsBundle}
          branchName={modal.branchName}
          token={token}
          onClose={() => setModal(null)}
          onSuccess={() => { setModal(null); fetchBilling() }}
        />
      )}
    </div>
  )
}// ─── HISTORY ROW ─────────────────────────────
// Renders one payment row with Complete / Cancel actions on awaiting_payment
function HistoryRow({ payment, token, onRefresh }) {
  const [cancelling,   setCancelling]   = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)  // inline confirm modal
  const [cancelError,  setCancelError]  = useState('')     // error inside confirm modal
  const [showComplete, setShowComplete] = useState(false)
  const [txnId,        setTxnId]        = useState('')
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')

  const STATUS_STYLES = {
    awaiting_payment: { bg: '#FEF9C3', color: '#713F12', label: 'Awaiting Payment' },
    pending_approval: { bg: '#DBEAFE', color: '#1E40AF', label: 'Pending Approval'  },
    approved:         { bg: '#D1FAE5', color: '#065F46', label: 'Approved'          },
    rejected:         { bg: '#FEE2E2', color: '#991B1B', label: 'Rejected'          },
    cancelled:        { bg: '#F1F5F9', color: '#475569', label: 'Cancelled'         },
  }

  const status = STATUS_STYLES[payment.status] || STATUS_STYLES.awaiting_payment

  // Friendly label for payment type
  const typeLabel = () => {
    if (payment.type === 'subscription' || payment.type === 'upgrade') {
      const planName = payment.plan
        ? payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)
        : ''
      return `Subscription — ${planName}`
    }
    if (payment.type === 'branch') return `Extra Branch — ${payment.metadata?.branchName || ''}`
    if (payment.type === 'sms')    return `SMS Bundle — ${payment.metadata?.bundle || ''} credits`
    return payment.type
  }

  // Called when user clicks OK inside the inline confirm modal
  const handleConfirmCancel = async () => {
    setCancelling(true)
    setCancelError('')
    try {
      const res  = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/billing/request/${payment.reference}/cancel`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (data.success) {
        setShowConfirm(false)
        onRefresh()
      } else {
        setCancelError(data.message || 'Could not cancel this request. Please try again.')
      }
    } catch {
      setCancelError('Cannot connect to server. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitProof = async (e) => {
    e.preventDefault()
    if (!txnId.trim()) { setError('Transaction ID is required.'); return }
    setSubmitting(true)
    setError('')
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/proof`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ reference: payment.reference, transactionId: txnId.trim() })
      })
      const data = await res.json()
      if (data.success) { setShowComplete(false); onRefresh() }
      else setError(data.message)
    } catch { setError('Cannot connect to server.') }
    finally { setSubmitting(false) }
  }

  return (
    <>
      {/* ── PAYMENT ROW ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: 'var(--space-4) var(--space-5)',
        borderBottom: '1px solid var(--border)',
        gap: 'var(--space-4)', flexWrap: 'wrap',
        transition: 'background var(--transition-fast)'
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {/* Description */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {typeLabel()}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>
            Ref: {payment.reference} ·{' '}
            {new Date(payment.createdAt).toLocaleDateString('en-GH', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </p>
        </div>

        {/* Status badge */}
        <span style={{
          fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 999, background: status.bg, color: status.color,
          whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {status.label}
        </span>

        {/* Amount */}
        <p style={{
          fontFamily: 'var(--font-heading)', fontWeight: 700,
          color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0,
          minWidth: 80, textAlign: 'right'
        }}>
          GHS {payment.amount}
        </p>

        {/* Action buttons — only shown for awaiting_payment */}
        {payment.status === 'awaiting_payment' && (
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
            <button
              className="btn-primary"
              style={{ fontSize: 'var(--text-xs)', padding: '6px 14px', whiteSpace: 'nowrap' }}
              onClick={() => setShowComplete(true)}
            >
              Complete Payment
            </button>
            <button
              className="btn-danger"
              style={{ fontSize: 'var(--text-xs)', padding: '6px 14px' }}
              onClick={() => { setCancelError(''); setShowConfirm(true) }}
              disabled={cancelling}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── CANCEL CONFIRM MODAL ── */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => !cancelling && setShowConfirm(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Cancel Payment Request?</h3>
              <button className="modal-close" onClick={() => setShowConfirm(false)} disabled={cancelling}>
                <span style={{ fontSize: 18 }}>×</span>
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center', gap: 'var(--space-4)',
                padding: 'var(--space-4) 0'
              }}>
                {/* Icon */}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: '#FEE2E2', display: 'flex',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertCircle size={26} color="var(--danger)" />
                </div>

                <div>
                  <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-base)', marginBottom: 6 }}>
                    Cancel this request?
                  </p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: 260 }}>
                    Reference <strong>{payment.reference}</strong> — GHS {payment.amount} will be cancelled.
                    You can make a new payment request after.
                  </p>
                </div>

                {/* Error message if cancel fails */}
                {cancelError && (
                  <div className="form-error" style={{ width: '100%', textAlign: 'left' }}>
                    {cancelError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 'var(--space-3)', width: '100%', justifyContent: 'center' }}>
                  <button
                    className="btn-outline"
                    onClick={() => setShowConfirm(false)}
                    disabled={cancelling}
                  >
                    Keep It
                  </button>
                  <button
                    className="btn-danger"
                    onClick={handleConfirmCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Yes, Cancel It'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── COMPLETE PAYMENT MODAL ── */}
      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Complete Payment</h3>
              <button className="modal-close" onClick={() => setShowComplete(false)}>
                <span style={{ fontSize: 18 }}>×</span>
              </button>
            </div>
            <div className="modal-body">

              {/* MoMo instructions reminder */}
              <div style={{
                background: 'var(--primary-light)', borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)', marginBottom: 'var(--space-5)'
              }}>
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary)', marginBottom: 6 }}>
                  Send GHS {payment.amount} via Mobile Money
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>
                    Number: <strong>{payment.paymentInstructions?.momoNumber || '0553951396'}</strong>
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)' }}>
                    Name: <strong>{payment.paymentInstructions?.accountName || 'Emmanuel Mensah'}</strong>
                  </p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Use reference: <strong style={{ color: 'var(--primary)' }}>{payment.reference}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmitProof}>
                {error && (
                  <div className="form-error" style={{ marginBottom: 'var(--space-4)' }}>
                    {error}
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">MoMo Transaction ID *</label>
                  <input
                    value={txnId}
                    onChange={e => { setTxnId(e.target.value); setError('') }}
                    className="form-input"
                    placeholder="e.g. 6537283819"
                    autoFocus
                    style={{ marginTop: 'var(--space-2)' }}
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Find this in your MoMo SMS confirmation after sending payment.
                  </p>
                </div>
                <div className="form-actions" style={{ marginTop: 'var(--space-5)' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowComplete(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit for Approval'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── PAYMENT HISTORY ──────────────────────────
// Fetches and renders all payment history for this org
function PaymentHistory({ token }) {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/billing/history`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setPayments(data.payments)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [token])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchPayments() }, [fetchPayments])

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
        <p className="spinner-message">Loading payment history...</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Table header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: 'var(--space-3) var(--space-5)',
        background: 'var(--surface-2)', borderBottom: '1px solid var(--border)',
        gap: 'var(--space-4)'
      }}>
        <p style={{ flex: 1, fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Description
        </p>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
          Status
        </p>
        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
          Amount
        </p>
        {/* spacer for action buttons column */}
        <div style={{ width: 180, flexShrink: 0 }} />
      </div>

      {payments.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-12)' }}>
          <div className="empty-state-icon">
            <CreditCard size={28} color="var(--text-muted)" />
          </div>
          <p className="empty-state-title">No payment history yet</p>
          <p className="empty-state-message">
            Your payments will appear here once you subscribe or purchase credits.
          </p>
        </div>
      ) : (
        payments.map(p => (
          <HistoryRow
            key={p._id}
            payment={p}
            token={token}
            onRefresh={fetchPayments}
          />
        ))
      )}
    </div>
  )
}