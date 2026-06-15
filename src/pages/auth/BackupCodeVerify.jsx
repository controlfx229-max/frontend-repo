import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, ArrowRight, KeyRound } from 'lucide-react'
import Logo from '../../components/Logo'

export default function BackupCodeVerify() {
  const { login }             = useAuth()
  const [code, setCode]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const tempToken = localStorage.getItem('tempToken')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/backup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          backupCode: code.trim().toUpperCase(),
          tempToken
        })
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Invalid backup code.')
        return
      }

      // Warn if codes are running low
      if (data.codesRemaining <= 2) {
        alert(`⚠️ Warning: You only have ${data.codesRemaining} backup code(s) remaining. Please regenerate them in your settings.`)
      }

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
            <KeyRound size={48} color="var(--primary, #f97316)"
              style={{ marginBottom: '12px' }} />
            <h2 style={{ margin: 0 }}>Use a backup code</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
              Enter one of your 8-character backup codes.<br />
              Each code can only be used once.
            </p>
          </div>

          {error && (
            <div className="login-error animate-slideUp">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Backup code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="XXXX-XXXX"
                className="form-input twofa-code-input"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading || code.length < 9}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Backup Code
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="login-register-link">
            Have your phone?{' '}
            <a href="/2fa-verify">Use authenticator app →</a>
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