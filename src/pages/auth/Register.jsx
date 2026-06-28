import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  ArrowRight, ArrowLeft,
  Loader2, Eye, EyeOff, CheckCircle,
  Building2, User, MapPin, Play,
  Users, CreditCard, Zap, BarChart2
} from 'lucide-react'
import Logo from '../../components/Logo'

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

const FEATURES = [
  { icon: Users,      text: 'Member & attendance management' },
  { icon: CreditCard, text: 'Tithes, offerings & pledges'   },
  { icon: Zap,        text: 'Smart automations & alerts'    },
  { icon: BarChart2,  text: 'Real-time church insights'     },
]

// ─── STEP INDICATOR ──────────────────────────
function StepIndicator({ current, total }) {
  return (
    <div style={{
      display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '32px'
    }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: i < current ? '#4F46E5' : i === current ? '#4F46E5' : '#E5E7EB',
            border: `2px solid ${i < current ? '#4F46E5' : i === current ? '#4F46E5' : '#D1D5DB'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700, color: i <= current ? '#fff' : '#6B7280',
            transition: 'all 0.3s ease'
          }}>
            {i < current ? <CheckCircle size={14} /> : <span>{i + 1}</span>}
          </div>
          {i < total - 1 && (
            <div style={{
              width: '16px', height: '2px',
              background: i < current ? '#4F46E5' : '#D1D5DB',
              transition: 'background 0.3s ease'
            }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── STEP 1: CHURCH DETAILS ──────────────────
function StepChurch({ form, onChange, error }) {
  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <Building2 size={22} color="#4F46E5" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Church Details
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Tell us about your church
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', background: '#FEE2E2',
          border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', fontWeight: 600,
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Church Name *
          </label>
          <input
            name="churchName" value={form.churchName} onChange={onChange}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#4F46E5'}
            onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
            placeholder="e.g. Victory Chapel International"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Denomination *
            </label>
            <select
              name="denomination" value={form.denomination} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
            >
              <option value="">Select denomination</option>
              {DENOMINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Country/Region *
            </label>
            <select
              name="country" value={form.country} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
            >
              <option value="">Select country</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Church Email *
            </label>
            <input
              name="churchEmail" type="email" value={form.churchEmail} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
              placeholder="info@yourchurch.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Church Phone *
            </label>
            <input
              name="churchPhone" value={form.churchPhone} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
              placeholder="+1 (555) 000-0000"
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
    <div>
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px'
        }}>
          <User size={22} color="#4F46E5" />
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
          Admin Account
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Create your administrator login
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '10px', background: '#FEE2E2',
          border: '1px solid #FECACA', color: '#991B1B', fontSize: '13px', fontWeight: 600,
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Your Full Name *
          </label>
          <input
            name="adminName" value={form.adminName} onChange={onChange}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
            }}
            placeholder="e.g. Pastor Emmanuel Mensah"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Your Email *
            </label>
            <input
              name="adminEmail" type="email" value={form.adminEmail} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Your Phone *
            </label>
            <input
              name="adminPhone" type="tel" value={form.adminPhone} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
              placeholder="+1 (555) 000-0000"
              inputMode="tel"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              name="adminPassword" type={showPassword ? 'text' : 'password'}
              value={form.adminPassword} onChange={onChange}
              style={{
                width: '100%', padding: '10px 14px', paddingRight: '40px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
              }}
              placeholder="Minimum 8 characters"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'
              }}
            >
              {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Confirm Password *
          </label>
          <input
            name="confirmPassword" type="password" value={form.confirmPassword} onChange={onChange}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '10px',
              border: '1.5px solid #E5E7EB', fontSize: '14px', fontFamily: 'inherit'
            }}
            placeholder="Re-enter your password"
          />
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 14px', borderRadius: '10px',
          background: '#ECFDF5', border: '1px solid #D1FAE5'
        }}>
          <CheckCircle size={16} color="#059669" style={{ flexShrink: 0 }} />
          <p style={{ fontSize: '13px', color: '#065F46', margin: 0 }}>
            You'll start on a <strong>30-day free trial</strong> — no credit card required.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── STEP 3: SUCCESS ─────────────────────────
function StepSuccess({ churchName, adminName }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <div style={{
        width: '64px', height: '64px', borderRadius: '50%',
        background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <CheckCircle size={36} color="#059669" />
      </div>
      <div>
        <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: '0 0 8px', letterSpacing: '-0.3px' }}>
          You're all set!
        </h2>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0, lineHeight: 1.6 }}>
          Welcome to MinistryOS, <strong>{adminName}</strong>.<br />
          <strong>{churchName}</strong> is ready to go.
        </p>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', width: '100%'
      }}>
        {[
          'Add your church members',
          'Set up departments and cell groups',
          'Track attendance and offerings',
          'View your church health score',
        ].map(f => (
          <div key={f} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px', background: '#F9FAFB'
          }}>
            <CheckCircle size={14} color="#059669" />
            <span style={{ fontSize: '13px', color: '#374151' }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN REGISTER PAGE ──────────────────────
export default function Register() {
  const { login } = useAuth()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    churchName: '', denomination: '', country: '', churchEmail: '', churchPhone: '',
    adminName: '', adminEmail: '', adminPhone: '', adminPassword: '', confirmPassword: ''
  })

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
      login(data.token, data.user)
      setStep(2)
      setTimeout(() => { window.location.href = '/dashboard' }, 2500)
    } catch {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .reg-page { min-height: 100vh; display: flex; background: #fff; flex-direction: row; }

        /* ── MOBILE HEADER (hidden on desktop) ── */
        .reg-mobile-header {
          display: none;
          flex-direction: column;
          gap: 16px;
          background: linear-gradient(145deg, #3730A3 0%, #4F46E5 45%, #6D28D9 100%);
          padding: 28px 24px 24px;
        }

        .reg-mobile-features {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .reg-mobile-feature-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px;
          padding: 5px 10px;
          font-size: 12px;
          color: rgba(255,255,255,0.9);
          font-weight: 500;
        }

        /* ── LEFT BRAND PANEL ── */
        .reg-brand {
          width: 45%;
          background: linear-gradient(145deg, #3730A3 0%, #4F46E5 45%, #6D28D9 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          padding: 56px 48px;
        }
        .reg-brand::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -160px; left: -160px;
          pointer-events: none;
        }
        .reg-brand::after {
          content: '';
          position: absolute;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -100px; right: -80px;
          pointer-events: none;
        }

        .reg-brand-inner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }

        .reg-brand-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
          margin: 0;
        }

        .reg-brand-sub {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.75);
          margin: 0 0 16px;
          max-width: 340px;
        }

        .reg-features {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reg-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: fadein 0.4s ease both;
        }

        @keyframes fadein { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }

        .reg-feature-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.6);
          flex-shrink: 0;
        }

        .reg-feature-item span:last-child {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.85);
        }

        .reg-learn-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          padding: 11px 16px;
          transition: background 0.18s, border-color 0.18s;
          width: fit-content;
          margin-top: 8px;
        }

        .reg-learn-cta:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.3);
        }

        .reg-learn-play {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .reg-learn-cta-text p:first-child {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1px;
        }

        .reg-learn-cta-text p:last-child {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }

        /* ── RIGHT FORM PANEL ── */
        .reg-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .reg-form-inner {
          width: 100%;
          max-width: 420px;
        }

        .reg-nav-buttons {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .btn-login {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: #4F46E5;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s;
        }

        .btn-login:hover { background: #4338CA; }
        .btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-outline {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 20px;
          background: transparent;
          color: #374151;
          border: 1.5px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }

        .btn-outline:hover {
          background: #F9FAFB;
          border-color: #D1D5DB;
        }

        .reg-login-link {
          margin-top: 24px;
          text-align: center;
          font-size: 13px;
          color: #6B7280;
        }

        .reg-login-link a {
          color: #4F46E5;
          text-decoration: none;
          font-weight: 700;
        }

        .reg-login-link a:hover { text-decoration: underline; }

        .reg-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #D1D5DB;
        }

        /* ── MOBILE ── */
        @media (max-width: 900px) {
          .reg-page { flex-direction: column; }
          .reg-brand { display: none; }
          .reg-mobile-header { display: flex; }
          .reg-form-panel { padding-top: 32px; align-items: flex-start; }
        }

        @media (max-width: 480px) {
          .reg-form-panel { padding: 24px 16px 28px; }
        }
      `}</style>

      <div className="reg-page">

        {/* MOBILE HEADER — visible only on small screens */}
        <div className="reg-mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Logo size={36} showText={false} />
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.2px' }}>
                MinistryOS
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                30-day free trial · No credit card
              </p>
            </div>
          </div>
          <div className="reg-mobile-features">
            {[
              'Member management',
              'Attendance tracking',
              'Tithes & offerings',
              'Smart automations',
              'Church insights',
            ].map((f, i) => (
              <div className="reg-mobile-feature-pill" key={i}>
                <CheckCircle size={11} color="rgba(255,255,255,0.7)" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* LEFT BRAND PANEL — visible only on desktop */}
        <div className="reg-brand">
          <div className="reg-brand-inner">

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Logo size={48} showText={false} />
              <h1 className="reg-brand-title">MinistryOS</h1>
              <p className="reg-brand-sub">
                The complete operating system for your church. Set up in minutes.
              </p>
            </div>

            <div className="reg-features">
              {[
                'Free 30-day trial — no credit card',
                'Full member management system',
                'Attendance & offering tracking',
                'Smart automations & alerts',
                'Real-time church health insights',
              ].map((f, i) => (
                <div className="reg-feature-item" key={i} style={{ animationDelay: `${i * 100}ms` }}>
                  <span className="reg-feature-dot" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <a href="/learn-more" className="reg-learn-cta">
              <div className="reg-learn-play">
                <Play size={13} color="#4F46E5" fill="#4F46E5" style={{ marginLeft: 2 }} />
              </div>
              <div className="reg-learn-cta-text">
                <p>See MinistryOS in action</p>
                <p>Watch the demo · Tour all features</p>
              </div>
              <ArrowRight size={14} style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)' }} />
            </a>

          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="reg-form-panel">
          <div className="reg-form-inner">

            {step < 2 && (
              <StepIndicator current={step} total={2} />
            )}

            {step === 0 && (
              <StepChurch form={form} onChange={handleChange} error={error} />
            )}
            {step === 1 && (
              <StepAdmin form={form} onChange={handleChange} error={error} showPassword={showPassword} setShowPassword={setShowPassword} />
            )}
            {step === 2 && (
              <StepSuccess churchName={form.churchName} adminName={form.adminName} />
            )}

            {step < 2 && (
              <div className="reg-nav-buttons">
                {step > 0 && (
                  <button className="btn-outline" onClick={() => { setStep(s => s - 1); setError('') }}>
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
                    {loading
                      ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating...</>
                      : <>Create Account <ArrowRight size={18} /></>}
                  </button>
                )}
              </div>
            )}

            {step < 2 && (
              <p className="reg-login-link">
                Already have an account? <a href="/login">Sign in →</a>
              </p>
            )}

            <p className="reg-footer">© 2026 EM Control IT Solutions · MinistryOS</p>
          </div>
        </div>

      </div>
    </>
  )
}