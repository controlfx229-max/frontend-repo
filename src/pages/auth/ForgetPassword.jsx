import { useState } from 'react'
import { ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import Logo from '../../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.toLowerCase().trim() })
      })

      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      // Always show success — even if email doesn't exist (prevents enumeration)
      setSent(true)

    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      {/* ── Left brand panel — same as Login */}
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

          {sent ? (
            /* ── SUCCESS STATE */
            <div className="forgot-success">
              <div className="forgot-success-icon">✉️</div>
              <h2>Check your email</h2>
              <p>
                If an account exists for <strong>{email}</strong>, 
                a password reset link has been sent. 
                Check your inbox and spam folder.
              </p>
              <p className="forgot-success-note">
                The link expires in <strong>1 hour</strong>.
              </p>
              <a href="/login" className="btn-login" style={{ marginTop: '24px', display: 'flex' }}>
                <ArrowLeft size={18} />
                Back to Sign In
              </a>
            </div>
          ) : (
            /* ── FORM STATE */
            <>
              <div className="login-form-header">
                <h2>Forgot password?</h2>
                <p>Enter your email and we'll send you a reset link.</p>
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="you@church.com"
                    className="form-input"
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <p className="login-register-link">
                Remember your password?{' '}
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