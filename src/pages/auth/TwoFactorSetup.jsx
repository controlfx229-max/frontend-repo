import { useState, useEffect } from 'react'
import { Loader2, ArrowRight, Copy, Check } from 'lucide-react'
import Logo from '../../components/Logo'

export default function TwoFactorSetup() {
  const [qrCodeUrl,   setQrCodeUrl]   = useState('')
  const [manualKey,   setManualKey]   = useState('')
  const [code,        setCode]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [fetching,    setFetching]    = useState(true)
  const [error,       setError]       = useState('')
  const [copied,      setCopied]      = useState(false)
  const [backupCodes, setBackupCodes] = useState([])
  const [done,        setDone]        = useState(false)

  // ── Fetch QR code on mount ─────────────────────────────────────────────────
  // We use tempToken here — NOT the regular token.
  // At this stage the user hasn't completed 2FA yet, so no full session exists.
  // The tempToken was issued by the login route and saved to localStorage.
  useEffect(() => {
    const fetchQR = async () => {
      try {
        const tempToken = localStorage.getItem('tempToken')

        if (!tempToken) {
          setError('Session expired. Please login again.')
          setFetching(false)
          return
        }

        const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/2fa/setup`, {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${tempToken}`
          }
        })
        const data = await res.json()

        if (!data.success) {
          setError(data.message || 'Failed to load QR code.')
          return
        }

        setQrCodeUrl(data.qrCodeUrl)
        setManualKey(data.manualKey)

      } catch {
        setError('Cannot connect to server.')
      } finally {
        setFetching(false)
      }
    }

    fetchQR()
  }, [])

  // ── Copy manual key to clipboard ──────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard.writeText(manualKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Confirm 2FA code ──────────────────────────────────────────────────────
  // Also uses tempToken — full token doesn't exist until after this step
  const handleConfirm = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const tempToken = localStorage.getItem('tempToken')

      if (!tempToken) {
        setError('Session expired. Please login again.')
        return
      }

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/2fa/confirm`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ code })
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.message || 'Invalid code. Try again.')
        return
      }

      setBackupCodes(data.backupCodes)
      setDone(true)

    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  // ── Finish — clear tempToken, go to platform ──────────────────────────────
  const handleFinish = () => {
    localStorage.removeItem('tempToken') // clean up — no longer needed
    window.location.href = '/admin-platform'
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

          {done ? (
            /* ── BACKUP CODES SCREEN ──────────────────────────────────────── */
            <div className="twofa-backup-screen">
              <div className="forgot-success-icon">🔐</div>
              <h2>2FA Enabled!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>
                Save these backup codes somewhere safe.
                Each can only be used <strong>once</strong>.
              </p>
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '20px' }}>
                ⚠️ You will not see these again.
              </p>

              <div className="backup-codes-grid">
                {backupCodes.map((c, i) => (
                  <div key={i} className="backup-code-item">
                    {c}
                  </div>
                ))}
              </div>

              <button
                onClick={handleFinish}
                className="btn-login"
                style={{ marginTop: '24px' }}
              >
                I've saved my codes — Continue
                <ArrowRight size={18} />
              </button>
            </div>

          ) : (
            /* ── SETUP SCREEN ─────────────────────────────────────────────── */
            <>
              <div className="login-form-header">
                <h2>Set up two-factor auth</h2>
                <p>Scan this QR code with Google Authenticator.</p>
              </div>

              {error && (
                <div className="login-error animate-slideUp">{error}</div>
              )}

              {fetching ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={32} className="spin" color="var(--primary)" />
                </div>
              ) : (
                <>
                  {/* ── QR CODE IMAGE ────────────────────────────────────── */}
                  {qrCodeUrl && (
                    <div className="twofa-qr-wrapper">
                      <img
                        src={qrCodeUrl}
                        alt="Scan with Google Authenticator"
                        className="twofa-qr-image"
                      />
                    </div>
                  )}

                  {/* ── MANUAL KEY FALLBACK ──────────────────────────────── */}
                  <div className="twofa-manual-key">
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Can't scan? Enter this key manually:
                    </p>
                    <div className="twofa-key-row">
                      <code className="twofa-key-text">{manualKey}</code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="twofa-copy-btn"
                      >
                        {copied
                          ? <Check size={14} color="#22c55e" />
                          : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* ── CONFIRM CODE FORM ────────────────────────────────── */}
                  <form onSubmit={handleConfirm} className="login-form"
                    style={{ marginTop: '24px' }}>
                    <div className="form-group">
                      <label className="form-label">
                        Enter the 6-digit code from the app
                      </label>
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
                          Confirm & Enable 2FA
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
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