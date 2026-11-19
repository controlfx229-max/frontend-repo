import { useState, useEffect } from 'react'
import { Loader2, ArrowLeft, Phone } from 'lucide-react'
import { AuthShell, Field, CodeField, FormError, SecuritySide } from '../../components/auth/AuthKit'

export default function ForgotPassword() {
  const [step, setStep]           = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone]         = useState('')
  const [otp, setOtp]             = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [maskedPhone, setMaskedPhone] = useState('')
  const [phoneForVerify, setPhoneForVerify] = useState('')
  const [cooldown, setCooldown]   = useState(0)

  // ── Cooldown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ── Normalize and format phone for Arkesel
  const normalizePhone = (input) => {
    let normalized = input.trim().replace(/[\s\-\(\)]/g, '');
    
    if (normalized.startsWith('+233')) {
      return normalized;
    } else if (normalized.startsWith('233')) {
      return '+' + normalized;
    } else if (normalized.startsWith('0')) {
      return '+233' + normalized.slice(1);
    } else {
      return '+233' + normalized;
    }
  };

  // ── Request OTP via SMS
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Just send raw — backend handles it
const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify({ phone: phone.trim() })  // ← raw input
});

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to send OTP. Please try again.');
        return;
      }

      // Move to OTP step
      setMaskedPhone(data.maskedPhone);
      setPhoneForVerify(data.phone);
      setStep('otp');
      setCooldown(60); // 60 second cooldown before resend
      setOtp('');

    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phoneForVerify, code: otp })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Invalid OTP. Please try again.');
        return;
      }

      // Redirect to reset password with temp token in URL
      window.location.href = data.redirectTo;

    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP
  const handleResendOTP = async () => {
    if (cooldown > 0) return;

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: phoneForVerify })
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to resend OTP.');
        return;
      }

      setOtp('');
      setCooldown(60);
      setError('');

    } catch (err) {
      setError('Cannot connect to server.');
    } finally {
      setLoading(false);
    }
  };

  // ── Go back to phone entry
  const handleBack = () => {
    setStep('phone');
    setPhone('');
    setOtp('');
    setError('');
    setMaskedPhone('');
    setCooldown(0);
  };

  return (
    <AuthShell side={<SecuritySide />}>
      {step === 'phone' ? (
        /* ── PHONE ENTRY */
        <>
          <h2 className="au-title">Reset your password</h2>
          <p className="au-sub">Enter your phone number to receive an OTP code.</p>
          <FormError>{error}</FormError>
          <form onSubmit={handlePhoneSubmit} className="au-form">
            <Field
              label="Phone number" name="phone" type="tel" icon={Phone}
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError('') }}
              placeholder="0553951396 or +233553951396"
              hint="We'll send a 6-digit code to your phone."
              required autoFocus inputMode="tel"
            />
            <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading}>
              {loading ? <><Loader2 size={18} className="mx-spin" /> Sending OTP</> : 'Send OTP code'}
            </button>
          </form>
          <div className="au-links">
            <span>Remember your password? <a href="/login">Back to sign in</a></span>
          </div>
        </>
      ) : (
        /* ── OTP VERIFICATION */
        <>
          <h2 className="au-title">Enter your OTP code</h2>
          <p className="au-sub">We've sent a 6-digit code to {maskedPhone}</p>
          <FormError>{error}</FormError>
          <form onSubmit={handleOTPSubmit} className="au-form">
            <CodeField
              label="6-digit code" name="otp" type="text" value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                setOtp(val)
                setError('')
              }}
              placeholder="000000" hint="Check your SMS messages. Code expires in 10 minutes."
              required maxLength={6} inputMode="numeric" autoComplete="one-time-code" autoFocus
            />
            <button type="submit" className="mx-btn mx-btn-primary mx-btn-block" disabled={loading || otp.length !== 6}>
              {loading ? <><Loader2 size={18} className="mx-spin" /> Verifying</> : 'Verify and reset password'}
            </button>
          </form>
          <div className="au-resend">
            <span>Didn't receive the code?</span>
            <button type="button" className="au-link-btn" onClick={handleResendOTP} disabled={cooldown > 0 || loading}>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </div>
          <button type="button" className="mx-btn mx-btn-line mx-btn-block" onClick={handleBack} style={{ marginTop: 20 }}>
            <ArrowLeft size={17} /> Use different number
          </button>
        </>
      )}
      <p className="au-legal">© 2026 EM Control IT Solutions. MinistryOS.</p>
    </AuthShell>
  )
}
