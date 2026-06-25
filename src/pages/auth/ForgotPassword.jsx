import { useState, useEffect } from 'react'
import { ArrowRight, Loader2, ArrowLeft, Phone } from 'lucide-react'
import Logo from '../../components/Logo'

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
      const normalized = normalizePhone(phone);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: normalized })
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
    <div className="login-page">

      {/* ── Left brand panel */}
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

          {step === 'phone' ? (
            /* ── PHONE ENTRY */
            <>
              <div className="login-form-header">
                <h2>Reset your password</h2>
                <p>Enter your phone number to receive an OTP code.</p>
              </div>

              {error && (
                <div className="login-error animate-slideUp">
                  {error}
                </div>
              )}

              <form onSubmit={handlePhoneSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <div className="input-phone-wrapper">
                    <Phone size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError('');
                      }}
                      placeholder="0553951396 or +233553951396"
                      className="form-input"
                      required
                      autoFocus
                      inputMode="tel"
                    />
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    We'll send a 6-digit code to your phone.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP code
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
          ) : (
            /* ── OTP VERIFICATION */
            <>
              <div className="login-form-header">
                <h2>Enter your OTP code</h2>
                <p>We've sent a 6-digit code to {maskedPhone}</p>
              </div>

              {error && (
                <div className="login-error animate-slideUp">
                  {error}
                </div>
              )}

              <form onSubmit={handleOTPSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">6-digit code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(val);
                      setError('');
                    }}
                    placeholder="000000"
                    className="form-input"
                    style={{ letterSpacing: '8px', fontSize: '24px', textAlign: 'center' }}
                    required
                    maxLength="6"
                    inputMode="numeric"
                    autoFocus
                  />
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Check your SMS messages. Code expires in 10 minutes.
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn-login"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & reset password
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={cooldown > 0 || loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: cooldown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                    cursor: cooldown > 0 ? 'default' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    textDecoration: 'underline'
                  }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleBack}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center',
                  width: '100%'
                }}
              >
                <ArrowLeft size={18} />
                Use different number
              </button>
            </>
          )}

          <p className="login-footer">
            © 2026 EM Control IT Solutions · MinistryOS
          </p>

        </div>
      </div>
    </div>
  );
}