import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowRight, ArrowLeft,
  Loader2, Eye, EyeOff, CheckCircle,
  Building2, User, MapPin
} from 'lucide-react'
import Logo from '../../components/Logo'

const DENOMINATIONS = [
  'Pentecostal', 'Charismatic', 'Baptist', 'Methodist',
  'Presbyterian', 'Catholic', 'Anglican', 'Assemblies of God',
  'Church of Pentecost', 'Action Chapel', 'Lighthouse',
  'Word Chapel', 'Non-denominational', 'Other'
]

const GHANA_CITIES = [
  'Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast',
  'Sunyani', 'Koforidua', 'Ho', 'Wa', 'Bolgatanga',
  'Tema', 'Kasoa', 'Madina', 'Ashaiman', 'Other'
]

// ─── STEP INDICATOR ──────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div className="reg-steps">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="reg-step-wrap">
          <div className={`reg-step-dot ${i < current ? 'done' : i === current ? 'active' : ''}`}>
            {i < current ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
          </div>
          {i < total - 1 && (
            <div className={`reg-step-line ${i < current ? 'done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── STEP 1: CHURCH DETAILS ──────────────────
function StepChurch({ form, onChange, error }) {
  return (
    <div className="reg-step-content">
      <div className="reg-step-header">
        <div className="reg-step-icon">
          <Building2 size={22} color="var(--primary)" />
        </div>
        <h2 className="reg-step-title">Church Information</h2>
        <p className="reg-step-sub">Tell us about your church</p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="reg-form">
        <div className="form-group">
          <label className="form-label">Church Name *</label>
          <input
            name="churchName" value={form.churchName} onChange={onChange}
            className="form-input" placeholder="e.g. Victory Chapel International"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Denomination *</label>
            <select name="denomination" value={form.denomination} onChange={onChange} className="form-input">
              <option value="">Select denomination</option>
              {DENOMINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">City *</label>
            <select name="city" value={form.city} onChange={onChange} className="form-input">
              <option value="">Select city</option>
              {GHANA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Church Email *</label>
            <input
              name="churchEmail" type="email" value={form.churchEmail} onChange={onChange}
              className="form-input" placeholder="info@yourchurch.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Church Phone *</label>
            <input
              name="churchPhone" value={form.churchPhone} onChange={onChange}
              className="form-input" placeholder="024XXXXXXX"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 2: ADMIN ACCOUNT ───────────────────
function StepAdmin({ form, onChange, error, showPassword, setShowPassword }) {
  return (
    <div className="reg-step-content">
      <div className="reg-step-header">
        <div className="reg-step-icon">
          <User size={22} color="var(--primary)" />
        </div>
        <h2 className="reg-step-title">Admin Account</h2>
        <p className="reg-step-sub">Create your administrator login</p>
      </div>

      {error && <div className="login-error">{error}</div>}

      <div className="reg-form">
        <div className="form-group">
          <label className="form-label">Your Full Name *</label>
          <input
            name="adminName" value={form.adminName} onChange={onChange}
            className="form-input" placeholder="e.g. Pastor Emmanuel Mensah"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Your Email Address *</label>
          <input
            name="adminEmail" type="email" value={form.adminEmail} onChange={onChange}
            className="form-input" placeholder="you@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password *</label>
          <div className="input-password-wrapper">
            <input
              name="adminPassword" type={showPassword ? 'text' : 'password'}
              value={form.adminPassword} onChange={onChange}
              className="form-input" placeholder="Minimum 8 characters"
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Confirm Password *</label>
          <input
            name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange}
            className="form-input" placeholder="Re-enter your password"
          />
        </div>

        <div className="reg-plan-info">
          <CheckCircle size={16} color="var(--success)" />
          <p>You'll start on a <strong>30-day free trial</strong> — no credit card required.</p>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 3: SUCCESS ─────────────────────────
function StepSuccess({ churchName, adminName }) {
  return (
    <div className="reg-step-content reg-success">
      <div className="reg-success-icon">
        <CheckCircle size={48} color="var(--success)" />
      </div>
      <h2 className="reg-step-title">You're all set!</h2>
      <p className="reg-step-sub">
        Welcome to MinistryOS, <strong>{adminName}</strong>.<br />
        <strong>{churchName}</strong> is ready to go.
      </p>
      <div className="reg-success-features">
        {[
          'Add your church members',
          'Set up departments and cell groups',
          'Track attendance and offerings',
          'View your church health score',
        ].map(f => (
          <div key={f} className="reg-success-feature">
            <CheckCircle size={14} color="var(--success)" />
            <span>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN REGISTER PAGE ──────────────────────
export default function Register() {
  const { login } = useAuth()
  const [step, setStep]               = useState(0)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    churchName:      '',
    denomination:    '',
    city:            '',
    churchEmail:     '',
    churchPhone:     '',
    adminName:       '',
    adminEmail:      '',
    adminPassword:   '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validateStep1 = () => {
    if (!form.churchName.trim())   { setError('Church name is required.');     return false }
    if (!form.denomination)        { setError('Please select a denomination.'); return false }
    if (!form.city)                { setError('Please select your city.');      return false }
    if (!form.churchEmail.trim())  { setError('Church email is required.');     return false }
    if (!form.churchPhone.trim())  { setError('Church phone is required.');     return false }
    return true
  }

  const validateStep2 = () => {
    if (!form.adminName.trim())      { setError('Your name is required.');            return false }
    if (!form.adminEmail.trim())     { setError('Your email is required.');           return false }
    if (form.adminPassword.length < 8) { setError('Password must be at least 8 characters.'); return false }
    if (form.adminPassword !== form.confirmPassword) { setError('Passwords do not match.'); return false }
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
          churchName:    form.churchName,
          denomination:  form.denomination,
          churchEmail:   form.churchEmail,
          churchPhone:   form.churchPhone,
          city:          form.city,
          adminName:     form.adminName,
          adminEmail:    form.adminEmail,
          adminPassword: form.adminPassword
        })
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }

      // Log in automatically
      login(data.token, data.user)
      setStep(2)

      // Redirect to dashboard after 2.5 seconds
      setTimeout(() => { window.location.href = '/dashboard' }, 2500)
    } catch {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* Left Branding Panel */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <Logo className="login-logo" size={72} showText={false} />
          <h1 className="login-brand-title">MinistryOS</h1>
          <p className="login-brand-sub">
            The complete operating system for your church. Set up in minutes.
          </p>
          <div className="login-features">
            {[
              'Free 30-day trial — no credit card',
              'Full member management system',
              'Attendance & offering tracking',
              'Smart automations & alerts',
              'Real-time church health insights',
            ].map((f, i) => (
              <div className="login-feature-item" key={i} style={{ animationDelay: `${i * 100}ms` }}>
                <span className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="login-circle login-circle-1" />
        <div className="login-circle login-circle-2" />
      </div>

      {/* Right Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-inner animate-fadeIn">

          {/* Step Indicator */}
          {step < 2 && (
            <div style={{ marginBottom: 'var(--space-8)' }}>
              <StepIndicator current={step} total={2} />
            </div>
          )}

          {/* Step Content */}
          {step === 0 && (
            <StepChurch form={form} onChange={handleChange} error={error} />
          )}
          {step === 1 && (
            <StepAdmin
              form={form} onChange={handleChange} error={error}
              showPassword={showPassword} setShowPassword={setShowPassword}
            />
          )}
          {step === 2 && (
            <StepSuccess churchName={form.churchName} adminName={form.adminName} />
          )}

          {/* Navigation Buttons */}
          {step < 2 && (
            <div className="reg-nav-buttons">
              {step > 0 && (
                <button className="btn-outline reg-back-btn" onClick={() => { setStep(s => s - 1); setError('') }}>
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              {step === 0 && (
                <button className="btn-login" onClick={handleNext}>
                  Next <ArrowRight size={18} />
                </button>
              )}
              {step === 1 && (
                <button className="btn-login" onClick={handleSubmit} disabled={loading}>
                  {loading ? <><Loader2 size={18} className="spin" /> Creating account...</> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              )}
            </div>
          )}

          {step < 2 && (
            <p className="login-register-link">
              Already have an account? <a href="/login">Sign in →</a>
            </p>
          )}

          <p className="login-footer">© 2026 EM Control IT Solutions · MinistryOS</p>
        </div>
      </div>
    </div>
  )
}