// PaystackCallback.jsx — MinistryOS
// Located at: client/src/pages/billing/PaystackCallback.jsx
// ───────────────────────────────────────────────────────────
// Where Paystack sends the church after they pay (or give up).
// URL: /billing/paystack/callback?reference=MOS-1001-ab12cd34
//
// We do NOT trust the URL to mean "paid". Anyone can type that address.
// The page asks our server to check with Paystack, then shows the real result.
//
// It keeps checking for ~90 seconds because Mobile Money approvals (the
// prompt on the church's phone) can take a minute to complete.
// Even if the church closes this page, the Paystack webhook on the server
// activates the plan anyway.

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const POLL_EVERY_MS = 3000
const MAX_TRIES     = 30          // 30 × 3s ≈ 90 seconds

export default function PaystackCallback() {
  const { token } = useAuth()
  const [params]  = useSearchParams()
  const reference = params.get('reference') || params.get('trxref')

  const [phase,   setPhase]   = useState(reference ? 'checking' : 'missing')
  const [message, setMessage] = useState('')
  const tries = useRef(0)

  // Keep asking the server until we get a final answer
  useEffect(() => {
    if (!reference || !token) return
    let cancelled = false
    let timer

    const check = async () => {
      tries.current += 1
      try {
        const res  = await fetch(
          `${import.meta.env.VITE_API_URL}/billing/paystack/verify/${encodeURIComponent(reference)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await res.json()
        if (cancelled) return

        if (data.status === 'approved') { setPhase('success'); return }
        if (data.status === 'flagged')  { setMessage(data.message || ''); setPhase('flagged'); return }
        if (['failed', 'abandoned', 'reversed'].includes(data.status)) {
          setMessage(data.message || ''); setPhase('failed'); return
        }
      } catch { /* network blip: just try again */ }

      if (cancelled) return
      if (tries.current >= MAX_TRIES) { setPhase('timeout'); return }
      timer = setTimeout(check, POLL_EVERY_MS)
    }

    check()
    return () => { cancelled = true; clearTimeout(timer) }
  }, [reference, token])

  // After success, reload /billing so the whole app picks up the new active plan
  useEffect(() => {
    if (phase !== 'success') return
    const t = setTimeout(() => window.location.assign('/billing'), 3500)
    return () => clearTimeout(t)
  }, [phase])

  const goBilling = () => window.location.assign('/billing')

  const view = {
    checking: {
      icon: <div className="spinner" style={{ margin: '0 auto' }} />,
      title: 'Confirming your payment…',
      text: 'Please keep this page open. If you were sent a Mobile Money prompt, approve it on your phone. This can take up to a minute.'
    },
    success: {
      icon: <CheckCircle size={44} color="var(--success)" />,
      bg: 'var(--success-bg)',
      title: 'Payment received!',
      text: 'Your plan is now active. Taking you back to Billing…'
    },
    failed: {
      icon: <XCircle size={44} color="var(--danger)" />,
      bg: 'var(--danger-bg)',
      title: 'Payment was not completed',
      text: message || 'No money was taken. You can try again from the Payment History tab.'
    },
    flagged: {
      icon: <AlertCircle size={44} color="var(--warning)" />,
      bg: '#FEF9C3',
      title: 'We are reviewing your payment',
      text: message || 'We received your payment but need to check it. We will contact you shortly.'
    },
    timeout: {
      icon: <AlertCircle size={44} color="var(--warning)" />,
      bg: '#FEF9C3',
      title: 'Still waiting for confirmation',
      text: 'If you already approved the payment, please do NOT pay again. Your plan activates automatically as soon as Paystack confirms it. Check Billing in a few minutes.'
    },
    missing: {
      icon: <XCircle size={44} color="var(--danger)" />,
      bg: 'var(--danger-bg)',
      title: 'No payment found',
      text: 'This page is opened by Paystack after you pay. Go to Billing and start the payment from there.'
    }
  }[phase]

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-12) var(--space-4)' }}>
      <div style={{
        width: '100%', maxWidth: 460, textAlign: 'center',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-10) var(--space-6)'
      }}>
        <div style={{
          width: 80, height: 80, margin: '0 auto var(--space-5)', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: view.bg || 'transparent'
        }}>
          {view.icon}
        </div>

        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
          {view.title}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
          {view.text}
        </p>

        {phase !== 'checking' && (
          <button className="btn-primary" onClick={goBilling}>Go to Billing</button>
        )}
      </div>
    </div>
  )
}
