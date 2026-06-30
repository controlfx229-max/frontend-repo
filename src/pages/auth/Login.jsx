import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2, Users, BarChart2, Zap, CreditCard } from 'lucide-react'
import Logo from '../../components/Logo'

const FEATURES = [
  { icon: Users,      text: 'Member & attendance management' },
  { icon: CreditCard, text: 'Tithes, offerings & pledges'   },
  { icon: Zap,        text: 'Smart automations & alerts'    },
  { icon: BarChart2,  text: 'Real-time church insights'     },
]

export default function Login() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [form, setForm]                 = useState({ email: '', password: '' })

  useEffect(() => {
    const msg = localStorage.getItem('logoutMessage')
    if (msg) { setError(msg); localStorage.removeItem('logoutMessage') }
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

  return (
    <>
      <style>{`
        /* ── LOGIN PAGE LAYOUT ── */
        .login-page {
          min-height: 100vh;
          display: flex;
        }

        /* ══════════════════════════════════════
           LEFT BRAND PANEL  (desktop only)
        ══════════════════════════════════════ */
        .login-brand {
          width: 45%;
          background: linear-gradient(145deg, #3730A3 0%, #4F46E5 45%, #6D28D9 100%);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .login-brand::before {
          content: '';
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          top: -160px; left: -160px;
          pointer-events: none;
        }
        .login-brand::after {
          content: '';
          position: absolute;
          width: 340px; height: 340px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          bottom: -100px; right: -80px;
          pointer-events: none;
        }

        .login-brand-inner {
          position: relative;
          z-index: 2;
          padding: 56px 48px;
          display: flex;
          flex-direction: column;
          gap: 0;
          width: 100%;
        }

        /* Logo */
        .login-logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 40px;
        }
        .login-logo-wordmark {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .login-logo-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 2px 8px;
          border-radius: 4px;
          margin-left: 4px;
        }

        /* Headline block */
        .login-headline {
          margin-bottom: 28px;
        }
        .login-headline-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin: 0 0 10px;
        }
        .login-headline-h1 {
          font-size: clamp(26px, 2.6vw, 34px);
          font-weight: 800;
          color: #fff;
          line-height: 1.15;
          margin: 0 0 14px;
          letter-spacing: -0.5px;
        }
        .login-headline-h1 em {
          font-style: normal;
          color: #A5B4FC;
        }
        .login-headline-body {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(255,255,255,0.6);
          margin: 0;
          max-width: 340px;
        }

        /* Feature list */
        .login-features {
          display: flex;
          flex-direction: column;
          gap: 11px;
          margin-bottom: 32px;
        }
        .login-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: lf-fadein 0.4s ease both;
        }
        @keyframes lf-fadein {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .login-feature-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-feature-text {
          font-size: 13.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
        }

        /* Divider */
        .login-brand-divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin-bottom: 24px;
        }

        /* Learn More CTA */
        .login-learn-cta {
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
        }
        .login-learn-cta:hover {
          background: rgba(255,255,255,0.18);
          border-color: rgba(255,255,255,0.3);
        }
        .login-learn-cta-play {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-learn-cta-text p:first-child {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1px;
        }
        .login-learn-cta-text p:last-child {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .login-learn-cta-arrow {
          margin-left: auto;
          color: rgba(255,255,255,0.4);
        }

        /* ══════════════════════════════════════
           MOBILE BRAND HEADER  (hidden on desktop)
           Full-width purple block that replaces
           the left panel on small screens.
        ══════════════════════════════════════ */
        .login-mobile-brand {
          display: none; /* shown via media query below */
          background: linear-gradient(145deg, #3730A3 0%, #4F46E5 50%, #6D28D9 100%);
          padding: 36px 24px 32px;
          position: relative;
          overflow: hidden;
        }
        /* ambient orb top-right */
        .login-mobile-brand::before {
          content: '';
          position: absolute;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          top: -80px; right: -80px;
          pointer-events: none;
        }

        .login-mobile-brand-inner {
          position: relative;
          z-index: 2;
        }

        /* Logo row inside mobile header */
        .login-mobile-logo-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .login-mobile-wordmark {
          font-size: 18px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .login-mobile-badge {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 2px 7px;
          border-radius: 4px;
        }

        /* Headline */
        .login-mobile-eyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin: 0 0 8px;
        }
        .login-mobile-h1 {
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 10px;
          letter-spacing: -0.4px;
        }
        .login-mobile-h1 em {
          font-style: normal;
          color: #A5B4FC;
        }
        .login-mobile-body {
          font-size: 13px;
          line-height: 1.65;
          color: rgba(255,255,255,0.6);
          margin: 0 0 20px;
        }

        /* Feature pills — 2×2 grid on mobile */
        .login-mobile-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }
        .login-mobile-feature-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 8px 10px;
        }
        .login-mobile-feature-icon {
          width: 24px; height: 24px;
          border-radius: 6px;
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-mobile-feature-text {
          font-size: 11.5px;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          line-height: 1.3;
        }

        /* Divider */
        .login-mobile-divider {
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin-bottom: 16px;
        }

        /* Learn More CTA inside mobile header */
        .login-mobile-learn-cta {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 10px;
          padding: 10px 14px;
          transition: background 0.18s;
        }
        .login-mobile-learn-cta:hover {
          background: rgba(255,255,255,0.18);
        }
        .login-mobile-learn-play {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: #fff;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .login-mobile-learn-cta-text p:first-child {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 1px;
        }
        .login-mobile-learn-cta-text p:last-child {
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin: 0;
        }
        .login-mobile-learn-arrow {
          margin-left: auto;
          color: rgba(255,255,255,0.4);
        }

        /* ══════════════════════════════════════
           RIGHT FORM PANEL
        ══════════════════════════════════════ */
        .login-form-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          padding: 40px 24px;
        }
        .login-form-inner {
          width: 100%;
          max-width: 420px;
        }
        .login-form-header {
          margin-bottom: 28px;
        }
        .login-form-header h2 {
          font-size: 26px;
          font-weight: 800;
          color: #111827;
          margin: 0 0 4px;
          letter-spacing: -0.3px;
        }
        .login-form-header p {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        /* Register CTA */
        .login-register-cta {
          margin-top: 24px;
          text-align: center;
        }
        .login-register-divider {
          font-size: 13px;
          color: #9CA3AF;
          margin: 0 0 10px;
        }
        .btn-register {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          padding: 11px 20px;
          border: 1.5px solid #4F46E5;
          border-radius: 10px;
          color: #4F46E5;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s;
        }
        .btn-register:hover { background: #F5F3FF; }

        .login-footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #D1D5DB;
        }

        /* ══════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════ */
        @media (max-width: 900px) {
          /* Hide desktop left panel */
          .login-brand { display: none; }

          /* Stack page vertically */
          .login-page { flex-direction: column; }

          /* Show mobile brand header */
          .login-mobile-brand { display: block; }

          /* Form panel fills remaining space, top-aligned */
          .login-form-panel {
            align-items: flex-start;
            padding-top: 32px;
          }
        }

        @media (max-width: 480px) {
          .login-form-panel { padding: 24px 16px; padding-top: 28px; }
          .login-mobile-brand { padding: 28px 16px 24px; }
        }
      `}</style>

      <div className="login-page">

        {/* ── DESKTOP: LEFT BRAND PANEL ── */}
        <div className="login-brand">
          <div className="login-brand-inner">

            <div className="login-logo-row">
              <Logo size={36} showText={false} />
              <span className="login-logo-wordmark">MinistryOS</span>
              <span className="login-logo-badge">GL🌏BAL</span>
            </div>

            <div className="login-headline">
              <p className="login-headline-eyebrow">Church Management Software</p>
              <h1 className="login-headline-h1">
                Run your church with <em>clarity</em> and confidence.
              </h1>
              <p className="login-headline-body">
            Built for modern churches — manage members, track attendance, automate communication, manage finances, and gain real-time insights from anywhere.
              </p>
            </div>

            <div className="login-features">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <div className="login-feature-item" key={i} style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="login-feature-icon">
                    <Icon size={14} color="rgba(255,255,255,0.85)" />
                  </div>
                  <span className="login-feature-text">{text}</span>
                </div>
              ))}
            </div>

            <div className="login-brand-divider" />

            <a href="/learn-more" className="login-learn-cta">
              <div className="login-learn-cta-play">
                <ArrowRight size={14} color="#4F46E5" />
              </div>
              <div className="login-learn-cta-text">
                <p>Learn More</p>
                <p>See features, pricing & how it works</p>
              </div>
              <ArrowRight size={14} className="login-learn-cta-arrow" />
            </a>

          </div>
        </div>

        {/* ── MOBILE: BRAND HEADER (replaces left panel on small screens) ── */}
        <div className="login-mobile-brand">
          <div className="login-mobile-brand-inner">

            {/* Logo */}
            <div className="login-mobile-logo-row">
              <Logo size={30} showText={false} />
              <span className="login-mobile-wordmark">MinistryOS</span>
              <span className="login-mobile-badge">GL🌏BAL</span>
            </div>

            {/* Headline */}
            <p className="login-mobile-eyebrow">Church Management Software</p>
            <h1 className="login-mobile-h1">
              Run your church with <em>clarity</em> and confidence.
            </h1>
            <p className="login-mobile-body">
              Built for modern churches — manage members, track attendance, automate communication, manage finances, and gain real-time insights from anywhere.
            </p>

            {/* Feature pills in a 2×2 grid */}
            <div className="login-mobile-features">
              {FEATURES.map(({ icon: Icon, text }, i) => (
                <div className="login-mobile-feature-pill" key={i}>
                  <div className="login-mobile-feature-icon">
                    <Icon size={12} color="rgba(255,255,255,0.85)" />
                  </div>
                  <span className="login-mobile-feature-text">{text}</span>
                </div>
              ))}
            </div>

            <div className="login-mobile-divider" />

            {/* Learn More CTA */}
            <a href="/learn-more" className="login-mobile-learn-cta">
              <div className="login-mobile-learn-play">
                <ArrowRight size={13} color="#4F46E5" />
              </div>
              <div className="login-mobile-learn-cta-text">
                <p>Learn More</p>
                <p>See features, pricing & how it works</p>
              </div>
              <ArrowRight size={14} className="login-mobile-learn-arrow" />
            </a>

          </div>
        </div>

        {/* ── FORM PANEL (desktop + mobile) ── */}
        <div className="login-form-panel">
          <div className="login-form-inner animate-fadeIn">

            <div className="login-form-header">
              <h2>Welcome back</h2>
              <p>Sign in to your MinistryOS account</p>
            </div>

            {error && <div className="login-error animate-slideUp">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@church.com"
                  className="form-input" required autoComplete="email"
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                  <a href="/forgot-password" className="form-link">Forgot password?</a>
                </div>
                <div className="input-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} placeholder="Enter your password"
                    className="form-input" required autoComplete="current-password"
                  />
                  <button type="button" className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility">
                    {showPassword
                      ? <EyeOff size={18} color="var(--text-muted)" />
                      : <Eye    size={18} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading
                  ? <><Loader2 size={18} className="spin" /> Signing in...</>
                  : <>Sign in <ArrowRight size={18} /></>}
              </button>
            </form>

            <div className="login-register-cta">
              <p className="login-register-divider">Don't have an account?</p>
              <a href="/register" className="btn-register">
                Register Your Church <ArrowRight size={16} />
              </a>
            </div>

            <p className="login-footer">© 2026 EM Control IT Solutions · MinistryOS</p>
          </div>
        </div>

      </div>
    </>
  )
}