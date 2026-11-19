import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, Mail, Lock, Users, CreditCard, Zap, ChartColumn, Gift, BadgeCheck } from 'lucide-react'
import { AuthShell, Field, FormError } from '../../components/auth/AuthKit'

const POINTS = [
  { icon: Users,       text: 'Member and attendance management' },
  { icon: CreditCard,  text: 'Tithes, offerings and pledges'    },
  { icon: Zap,         text: 'Smart automations and alerts'     },
  { icon: ChartColumn, text: 'Real-time church insights'        },
]

// Standard (non-founding) trial SMS credits — mirrors
// STANDARD_TRIAL_SMS_CREDITS in auth.controller.js. Only used as a
// display fallback before /auth/founding-status has responded, or once
// the founding promo has run out.
const STANDARD_TRIAL_SMS_FALLBACK = 200

export default function Login() {
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm]       = useState({ email: '', password: '' })

  // Live founding-church promo status. This page is public/pre-auth, so it
  // hits the unauthenticated /auth/founding-status endpoint (same one
  // Register.jsx and LearnMore.jsx use).
  const [founding, setFounding] = useState(null)

  useEffect(() => {
    const msg = localStorage.getItem('logoutMessage')
    if (msg) { setError(msg); localStorage.removeItem('logoutMessage') }
  }, [])

  useEffect(() => {
    const fetchFounding = async () => {
      try {
        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/founding-status`)
        const data = await res.json()
        if (data.success) setFounding(data.founding)
      } catch {
        // Non-critical — falls back to standard trial copy below.
      }
    }
    fetchFounding()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Login failed. Please try again.'); return }
      if (data.requires2FA) {
        localStorage.setItem('tempToken', data.tempToken)
        window.location.href = data.setup2FA ? '/2fa-setup' : '/2fa-verify'
        return
      }
      localStorage.setItem('token',        data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user',         JSON.stringify(data.user))
      login(data.token, data.user)
      window.location.href = data.redirectTo || '/dashboard'
    } catch { setError('Cannot connect to server. Please try again.') }
    finally  { setLoading(false) }
  }

  const promoActive  = founding?.promoActive
  const remaining    = founding?.remaining
  const bonusCredits = founding?.bonusCredits || 200

  // One source of truth for the trial copy, used in the brand panel and
  // under the register button, so both always match the backend.
  const trialPanel = promoActive
    ? <>New here? Get a <strong>1-month free trial</strong> and <strong>{bonusCredits} free SMS credits</strong>. {remaining} founding spot{remaining !== 1 ? 's' : ''} left.</>
    : <>New here? Get a <strong>1-month free trial</strong> and <strong>{STANDARD_TRIAL_SMS_FALLBACK} free SMS credits</strong>.</>

  const trialNote = promoActive
    ? `1-month free trial, ${bonusCredits} free SMS credits, no card required`
    : `1-month free trial, ${STANDARD_TRIAL_SMS_FALLBACK} free SMS credits, no card required`

  const side = (
    <>
      <h1 className="au-h1">Run your church with clarity and confidence.</h1>
      <p className="au-lede">
        Built for modern churches. Manage members, track attendance, automate communication,
        manage finances, and gain real-time insights from anywhere.
      </p>
      <ul className="au-points">
        {POINTS.map(({ icon: Icon, text }) => (
          <li key={text}><Icon size={20} strokeWidth={1.5} aria-hidden="true" />{text}</li>
        ))}
      </ul>
      <div className="au-promo">
        <Gift size={18} strokeWidth={1.6} aria-hidden="true" />
        <p>{trialPanel}</p>
      </div>
      <a href="/learn-more" className="au-learn">See features, pricing and how it works</a>
    </>
  )

  return (
    <AuthShell side={side}>
      <h2 className="au-title">Welcome back</h2>
      <p className="au-sub">Sign in to your MinistryOS account.</p>

      <FormError>{error}</FormError>

      <form onSubmit={handleSubmit} className="au-form">
        <Field
          label="Email address" name="email" type="email" icon={Mail}
          value={form.email} onChange={handleChange}
          placeholder="you@church.com" required autoComplete="email"
        />
        <Field
          label="Password" name="password" type="password" icon={Lock}
          value={form.password} onChange={handleChange}
          placeholder="Enter your password" required autoComplete="current-password"
          labelRight={<a href="/forgot-password">Forgot password?</a>}
        />
        <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? <><Loader2 size={18} className="mx-spin" /> Signing in</> : 'Sign in'}
        </button>
      </form>

      <div className="au-alt">
        <p>Don't have an account?</p>
        <a href="/register" className="mx-btn mx-btn-line mx-btn-block">Register your church</a>
        <p className="au-trialnote"><BadgeCheck size={16} strokeWidth={1.7} aria-hidden="true" />{trialNote}</p>
      </div>

      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
