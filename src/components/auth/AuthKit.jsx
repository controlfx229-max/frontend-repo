import { useState } from 'react'
import { Eye, EyeOff, CircleAlert, ShieldCheck, Lock, KeyRound } from 'lucide-react'
import BrandMark from '../BrandMark'
import ArchLines from '../ArchLines'
import '../../styles/brand.css'
import '../../styles/auth.css'

/* Two-panel shell shared by Login and Register. */
export function AuthShell({ side, children, wide = false }) {
  return (
    <div className="mx au">
      <aside className="au-side">
        <ArchLines className="au-arches" />
        <a href="/" className="au-side-brand" aria-label="MinistryOS home">
          <BrandMark tone="light" size={38} />
        </a>
        <div className="au-side-body">{side}</div>
        <p className="au-side-foot">EM Control IT Solutions</p>
      </aside>
      <main className="au-main">
        <div className={`au-card${wide ? ' au-card-wide' : ''}`}>{children}</div>
      </main>
    </div>
  )
}

/* Label + input (+ optional leading icon, hint, or password reveal). */
export function Field({ label, name, icon: Icon, hint, labelRight, children, ...input }) {
  const [reveal, setReveal] = useState(false)
  const isPassword = input.type === 'password'
  const id = `f-${name}`
  return (
    <div className="fd">
      <div className="fd-label">
        <label htmlFor={id}>{label}</label>
        {labelRight}
      </div>
      <div className="fd-wrap">
        {Icon && <span className="fd-icon"><Icon size={18} strokeWidth={1.6} aria-hidden="true" /></span>}
        <input
          id={id}
          name={name}
          className={`fd-input${Icon ? ' has-icon' : ''}${isPassword ? ' has-action' : ''}`}
          {...input}
          type={isPassword && reveal ? 'text' : input.type}
        />
        {isPassword && (
          <button type="button" className="fd-action" onClick={() => setReveal(v => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}>
            {reveal ? <EyeOff size={18} strokeWidth={1.6} /> : <Eye size={18} strokeWidth={1.6} />}
          </button>
        )}
      </div>
      {hint && <p className="fd-hint">{hint}</p>}
      {children}
    </div>
  )
}

export function SelectField({ label, name, icon: Icon, options, placeholder, value, onChange }) {
  const id = `f-${name}`
  return (
    <div className="fd">
      <div className="fd-label"><label htmlFor={id}>{label}</label></div>
      <div className="fd-wrap">
        {Icon && <span className="fd-icon"><Icon size={18} strokeWidth={1.6} aria-hidden="true" /></span>}
        <select id={id} name={name} value={value} onChange={onChange}
          className={`fd-input${Icon ? ' has-icon' : ''}${value ? '' : ' is-empty'}`}>
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  )
}

export function FormError({ children }) {
  if (!children) return null
  return (
    <div className="au-error" role="alert">
      <CircleAlert size={18} strokeWidth={1.7} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

/* Side-panel content for the recovery and two-factor screens. */
export function SecuritySide() {
  const points = [
    { icon: ShieldCheck, text: 'Two-factor protection for administrators' },
    { icon: Lock,        text: 'Church data encrypted and backed up daily' },
    { icon: KeyRound,    text: 'Secure recovery by SMS or backup code'    },
  ]
  return (
    <>
      <h1 className="au-h1">Your church data stays in the right hands.</h1>
      <p className="au-lede">
        Only people you trust can sign in. If something goes wrong, you can always get back in safely.
      </p>
      <ul className="au-points">
        {points.map(({ icon: Icon, text }) => (
          <li key={text}><Icon size={20} strokeWidth={1.5} aria-hidden="true" />{text}</li>
        ))}
      </ul>
    </>
  )
}

/* Large centred one-time-code input. */
export function CodeField({ label, name, hint, ...input }) {
  const id = `f-${name}`
  return (
    <div className="fd">
      <div className="fd-label"><label htmlFor={id}>{label}</label></div>
      <input id={id} name={name} className="fd-input fd-code" {...input} />
      {hint && <p className="fd-hint">{hint}</p>}
    </div>
  )
}

/* Round icon badge shown above a screen title. */
export function IconBadge({ icon: Icon }) {
  return <div className="au-done-badge"><Icon size={26} strokeWidth={1.6} aria-hidden="true" /></div>
}
