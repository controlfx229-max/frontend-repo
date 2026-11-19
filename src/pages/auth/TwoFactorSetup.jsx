import { useState, useEffect } from 'react'
import { Loader2, Copy, Check, TriangleAlert, ShieldCheck } from 'lucide-react'
import { AuthShell, CodeField, FormError, SecuritySide, IconBadge } from '../../components/auth/AuthKit'

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

        const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/setup`, {
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

      const res  = await fetch(`${import.meta.env.VITE_API_URL}/auth/2fa/confirm`, {
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
    <AuthShell side={<SecuritySide />}>
      {done ? (
        /* ── BACKUP CODES SCREEN */
        <div className="au-done">
          <IconBadge icon={ShieldCheck} />
          <h2 className="au-title">2FA enabled</h2>
          <p>Save these backup codes somewhere safe. Each can only be used <strong>once</strong>.</p>
          <div className="au-note">
            <TriangleAlert size={18} strokeWidth={1.6} aria-hidden="true" />
            <p>You will not see these codes again.</p>
          </div>
          <div className="au-codes">
            {backupCodes.map((c, i) => <div key={i}>{c}</div>)}
          </div>
          <button onClick={handleFinish} className="mx-btn mx-btn-primary mx-btn-block" style={{ marginTop: 24 }}>
            I've saved my codes, continue
          </button>
        </div>
      ) : (
        /* ── SETUP SCREEN */
        <>
          <h2 className="au-title">Set up two-factor auth</h2>
          <p className="au-sub">Scan this QR code with Google Authenticator.</p>
          <FormError>{error}</FormError>
          {fetching ? (
            <div className="au-center"><Loader2 size={32} className="mx-spin" /></div>
          ) : (
            <>
              {qrCodeUrl && (
                <div className="au-qr">
                  <img src={qrCodeUrl} alt="Scan with Google Authenticator" />
                </div>
              )}
              <div className="fd">
                <p className="fd-hint">Can't scan? Enter this key manually:</p>
                <div className="au-keyrow">
                  <code>{manualKey}</code>
                  <button type="button" onClick={handleCopy} aria-label="Copy key">
                    {copied ? <Check size={16} strokeWidth={2.2} /> : <Copy size={16} strokeWidth={1.8} />}
                  </button>
                </div>
              </div>
              <form onSubmit={handleConfirm} className="au-form" style={{ marginTop: 26 }}>
                <CodeField
                  label="Enter the 6-digit code from the app" name="code" type="text" value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
                  placeholder="000000" maxLength={6} required autoComplete="one-time-code" autoFocus inputMode="numeric"
                />
                <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading || code.length !== 6}>
                  {loading ? <><Loader2 size={18} className="mx-spin" /> Verifying</> : 'Confirm and enable 2FA'}
                </button>
              </form>
            </>
          )}
        </>
      )}
      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
