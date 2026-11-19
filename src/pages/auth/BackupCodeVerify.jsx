import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Loader2, KeyRound } from 'lucide-react'
import { AuthShell, Field, FormError, SecuritySide, IconBadge } from '../../components/auth/AuthKit'

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
    <AuthShell side={<SecuritySide />}>
      <IconBadge icon={KeyRound} />
      <h2 className="au-title">Use a backup code</h2>
      <p className="au-sub">Enter one of your 8-character backup codes. Each code can only be used once.</p>
      <FormError>{error}</FormError>
      <form onSubmit={handleSubmit} className="au-form">
        <Field
          label="Backup code" name="backupCode" type="text" value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError('') }}
          placeholder="XXXX-XXXX" required autoFocus autoComplete="off" spellCheck={false}
        />
        <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading || code.length < 9}>
          {loading ? <><Loader2 size={18} className="mx-spin" /> Verifying</> : 'Verify backup code'}
        </button>
      </form>
      <div className="au-links">
        <span>Have your phone? <a href="/2fa-verify">Use authenticator app</a></span>
        <a href="/login">Back to sign in</a>
      </div>
      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
