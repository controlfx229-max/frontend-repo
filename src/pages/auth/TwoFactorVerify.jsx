import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import Logo from '../../components/Logo'

export default function TwoFactorVerify() {
  const { login } = useAuth()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const tempToken = localStorage.getItem('tempToken')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/verify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code, tempToken })
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Invalid code. Please try again.')
        return
      }

      // ── Issue full session
      localStorage.removeItem('tempToken')
      localStorage.setItem('token',        data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user',         JSON.stringify(data.user))

      login(data.token, data.user)
      window.location.href = data.redirectTo || '/admin-platform'

    } catch {
      setError('Cannot connect to server.')
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

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <ShieldCheck size={48} color="var(--primary, #f97316)"
              style={{ marginBottom: '12px' }} />
            <h2 style={{ margin: 0 }}>Two-factor authentication</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Open Google Authenticator and enter your 6-digit code.
            </p>
          </div>

          {error && (
            <div className="login-error animate-slideUp">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Authentication code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  setError('')
                }}
                placeholder="000000"
                className="form-input twofa-code-input"
                maxLength={6}
                required
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading || code.length !== 6}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* ── Backup code fallback */}
          <p className="login-register-link">
            Lost your phone?{' '}
            <a href="/2fa-backup">Use a backup code →</a>
          </p>

          <p className="login-register-link">
            <a href="/login">← Back to Sign In</a>
          </p>

          <p className="login-footer">
            © 2026 EM Control IT Solutions · MinistryOS
          </p>
        </div>
      </div>
    </div>
  )
}