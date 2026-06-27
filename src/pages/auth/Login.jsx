import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2, PlayCircle } from 'lucide-react'
import Logo from '../../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  useEffect(() => {
    const msg = localStorage.getItem('logoutMessage')
    if (msg) {
      setError(msg)
      localStorage.removeItem('logoutMessage')
    }
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Login failed. Please try again.')
        return
      }

      if (data.requires2FA) {
        localStorage.setItem('tempToken', data.tempToken)
        window.location.href = data.setup2FA ? '/2fa-setup' : '/2fa-verify'
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))

      login(data.token, data.user)

      const redirectTo = data.redirectTo || '/dashboard'
      window.location.href = redirectTo
    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* ── LEFT BRAND PANEL ── */}
      <div className="login-brand">
        <div className="login-brand-inner">
          <Logo className="login-logo" size={48} showText={false} />

          {/* Enhanced headline + description */}
          <div className="login-brand-headline">
            <h1 className="login-brand-title">MinistryOS</h1>
            <p className="login-brand-tagline">
              The complete operating system for your church.
            </p>
            <p className="login-brand-desc">
              Built for Ghanaian churches, MinistryOS brings together everything
              your leadership team needs — member records, attendance, finances,
              pledges, communications, and smart automations — in one simple platform
              that works on any device, anywhere.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="login-features">
            {[
              'Member & attendance management',
              'Tithes, offerings & pledges',
              'Smart automations & alerts',
              'Real-time church insights',
            ].map((f, i) => (
              <div className="login-feature-item" key={i}
                style={{ animationDelay: `${i * 100}ms` }}>
                <span className="login-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* Learn More link */}
          <a href="/learn-more" className="login-learn-more">
            <PlayCircle size={16} />
            <span>See how MinistryOS works</span>
            <ArrowRight size={14} />
          </a>

          <div className="login-circle login-circle-1" />
          <div className="login-circle login-circle-2" />
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="login-form-panel">
        <div className="login-form-inner animate-fadeIn">

          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your MinistryOS account</p>
          </div>

          {error && (
            <div className="login-error animate-slideUp">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@church.com"
                className="form-input"
                required
                autoComplete="email"
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword
                    ? <EyeOff size={18} color="var(--text-muted)" />
                    : <Eye size={18} color="var(--text-muted)" />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <><Loader2 size={18} className="spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Mobile-only Learn More link (brand panel is hidden on mobile) */}
          <div className="login-learn-more-mobile">
            <a href="/learn-more">
              <PlayCircle size={14} /> See how MinistryOS works
            </a>
          </div>

          <div className="login-register-cta">
            <p className="login-register-divider">Don't have an account?</p>
            <a href="/register" className="btn-register">
              Register Your Church <ArrowRight size={16} />
            </a>
          </div>

          <p className="login-footer">
            © 2026 EM Control IT Solutions · MinistryOS
          </p>
        </div>
      </div>

      {/* Inline styles for new login elements */}
      <style>{`
        .login-brand-headline {
          margin-bottom: 28px;
        }
        .login-brand-title {
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .login-brand-tagline {
          font-size: 15px;
          color: rgba(255,255,255,0.85);
          font-weight: 500;
          margin: 0 0 14px;
        }
        .login-brand-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          margin: 0;
        }
        .login-learn-more {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 24px;
          padding: 9px 16px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 8px;
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.18s;
          position: relative;
          z-index: 2;
        }
        .login-learn-more:hover {
          background: rgba(255,255,255,0.2);
        }
        .login-learn-more-mobile {
          display: none;
          text-align: center;
          margin: 16px 0 0;
        }
        .login-learn-more-mobile a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .login-learn-more-mobile { display: block; }
        }
      `}</style>
    </div>
  )
}