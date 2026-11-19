import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, ShieldCheck } from 'lucide-react'
import { AuthShell, CodeField, FormError, SecuritySide, IconBadge } from '../../components/auth/AuthKit'

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
    <AuthShell side={<SecuritySide />}>
      <IconBadge icon={ShieldCheck} />
      <h2 className="au-title">Two-factor authentication</h2>
      <p className="au-sub">Open Google Authenticator and enter your 6-digit code.</p>
      <FormError>{error}</FormError>
      <form onSubmit={handleSubmit} className="au-form">
        <CodeField
          label="Authentication code" name="code" type="text" value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }}
          placeholder="000000" maxLength={6} required autoComplete="one-time-code" autoFocus inputMode="numeric"
        />
        <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading || code.length !== 6}>
          {loading ? <><Loader2 size={18} className="mx-spin" /> Verifying</> : 'Verify and sign in'}
        </button>
      </form>
      {/* ── Backup code fallback */}
      <div className="au-links">
        <span>Lost your phone? <a href="/2fa-backup">Use a backup code</a></span>
        <a href="/login">Back to sign in</a>
      </div>
      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
