import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  // ── Show message if redirected here after a forced logout ──
  // (e.g. account suspended mid-session)
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/login`, {
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

      // Route based on role
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
      <div className="login-brand">
        <div className="login-brand-inner">
          <Logo className="login-logo" size={48} showText={false} />
          <p className="login-brand-sub">
            The complete operating system for your church.
          </p>

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

          <div className="login-circle login-circle-1" />
          <div className="login-circle login-circle-2" />
        </div>
      </div>

      <div className="login-form-panel">
        <div className="login-form-inner animate-fadeIn">

          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your MinistryOS account</p>
          </div>

          {error && (
            <div className="login-error animate-slideUp">
              {error}
            </div>
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
                <a href="/forgot-password" className="form-link">
                  Forgot password?
                </a>
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

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>

          </form>

          <p className="login-register-link">
            New to MinistryOS?{' '}
            <a href="/register">Register your church →</a>
          </p>

          <p className="login-footer">
            © 2026 EM Control IT Solutions · MinistryOS
          </p>

        </div>
      </div>
    </div>
  )
}