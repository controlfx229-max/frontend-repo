import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loader2, Check, X, Lock } from 'lucide-react'
import { AuthShell, Field, FormError, SecuritySide, IconBadge } from '../../components/auth/AuthKit'

export default function ResetPassword() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]               = useState({ password: '', confirmPassword: '' })
      const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [done, setDone]               = useState(false)
  const [token, setToken]             = useState('')

  // ── Read token from URL: /reset-password/:token
  // This token comes from OTP verification (verifyOTP endpoint)
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

  // ── Password strength indicator
  const getStrength = (pw) => {
    if (!pw) return null
    if (pw.length < 6)  return { label: 'Too short',  color: '#C0392B', width: '20%' }
    if (pw.length < 8)  return { label: 'Weak',       color: '#D9730D', width: '40%' }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
                        return { label: 'Fair',        color: '#B7860B', width: '60%' }
    if (pw.length < 12) return { label: 'Good',        color: '#2E9B5F', width: '80%' }
                        return { label: 'Strong',      color: '#0F4A3C', width: '100%' }
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
        `${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`,
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

      // ── Save tokens and full user to localStorage
      localStorage.setItem('token',        data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user',         JSON.stringify(data.user || {}))

      // ── Update AuthContext with full user object
      // This is the same flow as Login — context updates before navigation
      login(data.token, data.user)

      // ── Show success state briefly
      setDone(true)

      // ── Navigate using React Router (no full page reload)
      // window.location.href was causing blank screen because it
      // reloaded before AuthContext finished updating
      setTimeout(() => {
        navigate(data.redirectTo || '/dashboard')
      }, 2000)

    } catch (err) {
      setError('Cannot connect to server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell side={<SecuritySide />}>
      {done ? (
        /* ── SUCCESS STATE */
        <div className="au-done">
          <IconBadge icon={Check} />
          <h2 className="au-title">Password updated</h2>
          <p>Your password has been reset successfully. Redirecting you to your dashboard…</p>
          <div className="au-progress" aria-hidden="true"><i /></div>
        </div>
      ) : (
        <>
          <h2 className="au-title">Set new password</h2>
          <p className="au-sub">Choose a strong password for your account.</p>
          <FormError>{error}</FormError>
          <form onSubmit={handleSubmit} className="au-form">
            <Field
              label="New password" name="password" type="password" icon={Lock}
              value={form.password} onChange={handleChange}
              placeholder="Min. 8 characters" required autoFocus autoComplete="new-password"
            >
              {strength && (
                <div className="au-strength">
                  <div className="au-strength-bar">
                    <div className="au-strength-fill" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </Field>
            <Field
              label="Confirm new password" name="confirmPassword" type="password" icon={Lock}
              value={form.confirmPassword} onChange={handleChange}
              placeholder="Repeat your password" required autoComplete="new-password"
            >
              {form.confirmPassword && (
                <p className="au-match" style={{ color: form.password === form.confirmPassword ? '#2E7D57' : '#C0392B' }}>
                  {form.password === form.confirmPassword
                    ? <><Check size={14} strokeWidth={2.4} /> Passwords match</>
                    : <><X size={14} strokeWidth={2.4} /> Passwords do not match</>}
                </p>
              )}
            </Field>
            <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading || !token} style={{ marginTop: 6 }}>
              {loading ? <><Loader2 size={18} className="mx-spin" /> Updating password</> : 'Update password'}
            </button>
          </form>
          <div className="au-links">
            <span>Remembered it? <a href="/login">Back to sign in</a></span>
          </div>
        </>
      )}
      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
