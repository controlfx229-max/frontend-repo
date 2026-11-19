import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowRight, ArrowLeft, Loader2, Check, Gift, BadgeCheck, Building2, Mail, Phone, User, Lock,
  Globe, Church, Users, CreditCard, Zap, ChartColumn, CalendarCheck, Activity,
} from 'lucide-react'
import { AuthShell, Field, SelectField, FormError } from '../../components/auth/AuthKit'

const DENOMINATIONS = [
  'Pentecostal', 'Charismatic', 'Baptist', 'Methodist',
  'Presbyterian', 'Catholic', 'Anglican', 'Assemblies of God',
  'Church of Pentecost', 'Action Chapel', 'Lighthouse',
  'Word Chapel', 'Non-denominational', 'Other'
]

const COUNTRIES = [
  'Ghana', 'Nigeria', 'Kenya', 'Uganda', 'South Africa',
  'Tanzania', 'Ethiopia', 'Cameroon', 'Zambia', 'Zimbabwe',
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Other'
]

const POINTS = [
  { icon: Users,       text: 'Full member management system'     },
  { icon: CreditCard,  text: 'Attendance and offering tracking'  },
  { icon: Zap,         text: 'Smart automations and alerts'      },
  { icon: ChartColumn, text: 'Real-time church health insights'  },
]

// Standard (non-founding) trial SMS credits — mirrors
// STANDARD_TRIAL_SMS_CREDITS in auth.controller.js. Only used as a
// display fallback before /auth/founding-status has responded; the
// actual value always comes from the backend at registration time.
const STANDARD_TRIAL_SMS_FALLBACK = 200

// ─── STEP INDICATOR ──────────────────────────
function Steps({ current }) {
  const steps = ['Church details', 'Admin account']
  return (
    <div className="au-steps" aria-label={`Step ${current + 1} of ${steps.length}`}>
      {steps.map((label, i) => (
        <div key={label} className={`au-step${i < current ? ' is-done' : ''}${i === current ? ' is-on' : ''}`}>
          <i />
          <span>{i < current && <Check size={14} strokeWidth={2.4} aria-hidden="true" />}{label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── STEP 1: CHURCH DETAILS ──────────────────
function StepChurch({ form, onChange, error }) {
  return (
    <>
      <h2 className="au-title">Church details</h2>
      <p className="au-sub">Tell us about your church.</p>
      <FormError>{error}</FormError>
      <div className="au-form">
        <Field label="Church name" name="churchName" icon={Church} value={form.churchName}
          onChange={onChange} placeholder="e.g. Victory Chapel International" />
        <div className="au-grid">
          <SelectField label="Denomination" name="denomination" icon={Building2} value={form.denomination}
            onChange={onChange} options={DENOMINATIONS} placeholder="Select denomination" />
          <SelectField label="Country or region" name="country" icon={Globe} value={form.country}
            onChange={onChange} options={COUNTRIES} placeholder="Select country" />
        </div>
        <div className="au-grid">
          <Field label="Church email" name="churchEmail" type="email" icon={Mail} value={form.churchEmail}
            onChange={onChange} placeholder="info@yourchurch.com" />
          <Field label="Church phone" name="churchPhone" icon={Phone} value={form.churchPhone}
            onChange={onChange} placeholder="+233 24 000 0000" inputMode="tel" />
        </div>
      </div>
    </>
  )
}

// ─── STEP 2: ADMIN ACCOUNT ───────────────────
function StepAdmin({ form, onChange, error, agreed, setAgreed, foundingStatus }) {
  const promoActive  = foundingStatus?.promoActive
  const remaining    = foundingStatus?.remaining
  const bonusCredits = foundingStatus?.bonusCredits || 200

  return (
    <>
      <h2 className="au-title">Admin account</h2>
      <p className="au-sub">Create your administrator login.</p>
      <FormError>{error}</FormError>
      <div className="au-form">
        <Field label="Your full name" name="adminName" icon={User} value={form.adminName}
          onChange={onChange} placeholder="e.g. Pastor Emmanuel Mensah" autoComplete="name" />
        <div className="au-grid">
          <Field label="Your email" name="adminEmail" type="email" icon={Mail} value={form.adminEmail}
            onChange={onChange} placeholder="you@example.com" autoComplete="email" />
          <Field label="Your phone" name="adminPhone" type="tel" icon={Phone} value={form.adminPhone}
            onChange={onChange} placeholder="+233 24 000 0000" inputMode="tel" autoComplete="tel" />
        </div>
        <div className="au-grid">
          <Field label="Password" name="adminPassword" type="password" icon={Lock} value={form.adminPassword}
            onChange={onChange} placeholder="Minimum 8 characters" autoComplete="new-password" />
          <Field label="Confirm password" name="confirmPassword" type="password" icon={Lock} value={form.confirmPassword}
            onChange={onChange} placeholder="Re-enter password" autoComplete="new-password" />
        </div>

        {/* Dynamic: shows the real founding-batch offer while spots remain, and falls
            back to the standard trial messaging once the founding batch is full. Never
            overpromises 200 credits to someone who won't actually get them. */}
        {promoActive ? (
          <div className="au-note">
            <Gift size={18} strokeWidth={1.6} aria-hidden="true" />
            <p>
              You'll start on a <strong>1-month free trial</strong>. Register now as one of our first{' '}
              {foundingStatus.limit} founding churches and get the full <strong>{bonusCredits} free SMS credits</strong>.
              Only <strong>{remaining} spot{remaining !== 1 ? 's' : ''} left</strong>. No credit card required.
            </p>
          </div>
        ) : (
          <div className="au-note is-plain">
            <BadgeCheck size={18} strokeWidth={1.6} aria-hidden="true" />
            <p>
              You'll start on a <strong>1-month free trial</strong> with{' '}
              <strong>{STANDARD_TRIAL_SMS_FALLBACK} free SMS credits</strong> to try automations. No credit card required.
              Your trial expires after 30 days, and you can upgrade anytime to keep going.
            </p>
          </div>
        )}

        <label className="au-check">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span>
            I have read and agree to the{' '}
            <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
          </span>
        </label>
      </div>
    </>
  )
}

// ─── STEP 3: SUCCESS ─────────────────────────
// Reflects the REAL values returned by the register API (smsCredits,
// isFoundingChurch, foundingChurchNumber) rather than a hardcoded claim.
function StepSuccess({ churchName, adminName, smsCredits, isFoundingChurch, foundingChurchNumber }) {
  const credits = smsCredits ?? STANDARD_TRIAL_SMS_FALLBACK
  const next = [
    { icon: Users,         text: 'Add your church members'            },
    { icon: Building2,     text: 'Set up departments and cell groups' },
    { icon: CalendarCheck, text: 'Track attendance and offerings'     },
    { icon: Activity,      text: 'View your church health score'      },
  ]
  return (
    <div className="au-done">
      <div className="au-done-badge"><Check size={28} strokeWidth={2} aria-hidden="true" /></div>
      <h2 className="au-title">You're all set</h2>
      <p>
        Welcome to MinistryOS, <strong>{adminName}</strong>.{' '}
        {isFoundingChurch ? (
          <><strong>{churchName}</strong> is ready, and you're <strong>Founding Church #{foundingChurchNumber}</strong>,
          with your <strong>1-month free trial</strong> and <strong>{credits} free SMS credits</strong> active.</>
        ) : (
          <><strong>{churchName}</strong> is ready, with your <strong>1-month free trial</strong> and{' '}
          <strong>{credits} free SMS credits</strong> active.</>
        )}
      </p>
      <ul className="au-next">
        {next.map(({ icon: Icon, text }) => (
          <li key={text}><Icon size={20} strokeWidth={1.5} aria-hidden="true" />{text}</li>
        ))}
      </ul>
      <p className="au-redirect">Taking you to your dashboard…</p>
    </div>
  )
}

// ─── MAIN REGISTER PAGE ──────────────────────
export default function Register() {
  const { login } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [form, setForm] = useState({
    churchName: '', denomination: '', country: '', churchEmail: '', churchPhone: '',
    adminName: '', adminEmail: '', adminPhone: '', adminPassword: '', confirmPassword: ''
  })

  // Live founding-church promo status — powers the dynamic SMS credit copy
  // on this page (brand panel, admin step banner, and success screen).
  const [foundingStatus, setFoundingStatus] = useState(null)

  // Snapshot of what the register API actually granted this church.
  const [regResult, setRegResult] = useState(null)

  useEffect(() => {
    const fetchFoundingStatus = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/founding-status`)
        const data = await res.json()
        if (data.success) setFoundingStatus(data.founding)
      } catch {
        // Non-critical — the page falls back to standard trial messaging.
      }
    }
    fetchFoundingStatus()
  }, [])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.churchName.trim()) { setError('Church name is required.'); return false }
    if (!form.denomination) { setError('Please select a denomination.'); return false }
    if (!form.country) { setError('Please select your country/region.'); return false }
    if (!form.churchEmail.trim()) { setError('Church email is required.'); return false }
    if (!form.churchPhone.trim()) { setError('Church phone is required.'); return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.adminName.trim()) { setError('Your name is required.'); return false }
    if (!form.adminEmail.trim()) { setError('Your email is required.'); return false }
    if (!form.adminPhone.trim()) { setError('Your phone number is required.'); return false }
    if (form.adminPassword.length < 8) { setError('Password must be at least 8 characters.'); return false }
    if (form.adminPassword !== form.confirmPassword) { setError('Passwords do not match.'); return false }
    if (!agreed) { setError('Please agree to the Terms of Service and Privacy Policy.'); return false }
    return true
  }

  const handleNext = () => {
    setError('')
    if (step === 0 && validateStep1()) setStep(1)
  }

  const handleSubmit = async () => {
    if (!validateStep2()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          churchName: form.churchName, denomination: form.denomination, churchEmail: form.churchEmail,
          churchPhone: form.churchPhone, country: form.country, adminName: form.adminName,
          adminEmail: form.adminEmail, adminPhone: form.adminPhone, adminPassword: form.adminPassword
        })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      // Capture the REAL granted values for the success screen —
      // never assume 200; the backend decides based on founding slot.
      setRegResult({
        smsCredits:           data.user?.smsCredits,
        isFoundingChurch:     data.user?.isFoundingChurch,
        foundingChurchNumber: data.user?.foundingChurchNumber
      })
      setStep(2)
      // Sign in only AFTER the success screen has been shown. Calling
      // login() earlier trips the RedirectIfAuthed guard on /register,
      // which jumped straight to the dashboard and skipped this screen.
      setTimeout(() => {
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        login(data.token, data.user)
        window.location.href = '/dashboard'
      }, 2500)
    } catch {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const promoActive  = foundingStatus?.promoActive
  const remaining    = foundingStatus?.remaining
  const bonusCredits = foundingStatus?.bonusCredits || 200

  const side = (
    <>
      <h1 className="au-h1">The complete operating system for your church.</h1>
      <p className="au-lede">Set up in minutes. Start with members and attendance, add giving and automations when you're ready.</p>
      <ul className="au-points">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text}><Icon size={20} strokeWidth={1.5} aria-hidden="true" />{text}</li>
        ))}
      </ul>
      <div className="au-promo">
        <Gift size={18} strokeWidth={1.6} aria-hidden="true" />
        {promoActive ? (
          <p>
            Start with a <strong>1-month free trial</strong>. Register now as one of our first{' '}
            {foundingStatus.limit} founding churches for the full <strong>{bonusCredits} free SMS credits</strong>.
            Only <strong>{remaining} spot{remaining !== 1 ? 's' : ''} left</strong>. No credit card required.
          </p>
        ) : (
          <p>
            Start with a <strong>1-month free trial</strong> and <strong>{STANDARD_TRIAL_SMS_FALLBACK} free SMS credits</strong>.
            No credit card required. Your trial expires after 30 days, and you can upgrade anytime to keep going.
          </p>
        )}
      </div>
      <a href="/learn-more" className="au-learn">See features, pricing and how it works</a>
    </>
  )

  return (
    <AuthShell side={side} wide>
      {step < 2 && <Steps current={step} />}

      {step === 0 && <StepChurch form={form} onChange={handleChange} error={error} />}
      {step === 1 && (
        <StepAdmin
          form={form} onChange={handleChange} error={error}
          agreed={agreed} setAgreed={setAgreed} foundingStatus={foundingStatus}
        />
      )}
      {step === 2 && (
        <StepSuccess
          churchName={form.churchName}
          adminName={form.adminName}
          smsCredits={regResult?.smsCredits}
          isFoundingChurch={regResult?.isFoundingChurch}
          foundingChurchNumber={regResult?.foundingChurchNumber}
        />
      )}

      {step < 2 && (
        <div className="au-actions">
          {step > 0 && (
            <button className="mx-btn mx-btn-line" onClick={() => { setStep(s => s - 1); setError('') }}>
              <ArrowLeft size={17} /> Back
            </button>
          )}
          {step === 0 && (
            <button className="mx-btn mx-btn-primary mx-btn-block" onClick={handleNext}>
              Continue <ArrowRight size={17} />
            </button>
          )}
          {step === 1 && (
            <button className="mx-btn mx-btn-primary mx-btn-block" onClick={handleSubmit} disabled={loading || !agreed}>
              {loading ? <><Loader2 size={18} className="mx-spin" /> Creating account</> : 'Create account'}
            </button>
          )}
        </div>
      )}

      {step < 2 && (
        <p className="au-signin">Already have an account? <a href="/login">Sign in</a></p>
      )}

      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
