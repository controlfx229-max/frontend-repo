import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'

export default function ResetPassword() {
  const { login } = useAuth()

  const [form, setForm]           = useState({ password: '', confirmPassword: '' })
  const [showPass, setShowPass]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [token, setToken]         = useState('')

  // ── Read token from URL: /reset-password/:token
  useEffect(() => {
    const parts = window.location.pathname.split('/')
    const t = parts[parts.length - 1]
    if (!t || t === 'reset-password') {
      setError('Invalid reset link. Please request a new one.')
    } else {
      setToken(t)
    }
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  // ── Basic password strength indicator
  const getStrength = (pw) => {
    if (!pw) return null
    if (pw.length < 6)  return { label: 'Too short',  color: '#ef4444', width: '20%' }
    if (pw.length < 8)  return { label: 'Weak',       color: '#f97316', width: '40%' }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
                        return { label: 'Fair',        color: '#eab308', width: '60%' }
    if (pw.length < 12) return { label: 'Good',        color: '#22c55e', width: '80%' }
                        return { label: 'Strong',      color: '#16a34a', width: '100%' }
  }

  const strength = getStrength(form.password)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.')
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters.')
    }

    setLoading(true)

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/auth/reset-password/${token}`,
        {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            password:        form.password,
            confirmPassword: form.confirmPassword
          })
        }
      )

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Reset failed. Please try again.')
        return
      }

      // ── Auto-login after successful reset (backend sends fresh token)
      localStorage.setItem('token',        data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user',         JSON.stringify(data.user || {}))

      login(data.token, data.user)
      setDone(true)

      // ── Redirect after short delay so user sees success message
      setTimeout(() => {
        window.location.href = data.redirectTo || '/dashboard'
      }, 2000)

    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Left brand panel */}
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

      {/* ── Right form panel */}
      <div className="login-form-panel">
        <div className="login-form-inner animate-fadeIn">

          {done ? (
            /* ── SUCCESS STATE */
            <div className="forgot-success">
              <div className="forgot-success-icon">✅</div>
              <h2>Password updated!</h2>
              <p>Your password has been reset successfully.</p>
              <p className="forgot-success-note">
                Redirecting you to your dashboard...
              </p>
              <div className="reset-redirect-bar">
                <div className="reset-redirect-progress" />
              </div>
            </div>
          ) : (
            <>
              <div className="login-form-header">
                <h2>Set new password</h2>
                <p>Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="login-error animate-slideUp">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">

                {/* ── New Password */}
                <div className="form-group">
                  <label className="form-label">New password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="form-input"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPass(!showPass)}
                      aria-label="Toggle password visibility"
                    >
                      {showPass
                        ? <EyeOff size={18} color="var(--text-muted)" />
                        : <Eye    size={18} color="var(--text-muted)" />}
                    </button>
                  </div>

                  {/* ── Strength bar */}
                  {strength && (
                    <div className="password-strength">
                      <div className="password-strength-bar">
                        <div
                          className="password-strength-fill"
                          style={{
                            width:      strength.width,
                            background: strength.color
                          }}
                        />
                      </div>
                      <span style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm new password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat your password"
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm
                        ? <EyeOff size={18} color="var(--text-muted)" />
                        : <Eye    size={18} color="var(--text-muted)" />}
                    </button>
                  </div>

                  {/* ── Match indicator */}
                  {form.confirmPassword && (
                    <p style={{
                      fontSize: '12px',
                      marginTop: '4px',
                      color: form.password === form.confirmPassword
                        ? '#22c55e' : '#ef4444'
                    }}>
                      {form.password === form.confirmPassword
                        ? '✓ Passwords match'
                        : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading || !token}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

              </form>

              <p className="login-register-link">
                Remembered it?{' '}
                <a href="/login">Back to Sign In →</a>
              </p>
            </>
          )}

          <p className="login-footer">
            © 2026 EM Control IT Solutions · MinistryOS
          </p>
        </div>
      </div>
    </div>
  )
}