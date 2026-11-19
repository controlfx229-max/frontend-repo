import { useId, useState } from 'react'

// Small dependency-free SVG charts for the dashboard.
// Every chart is responsive (viewBox), theme-aware (colours come from props / CSS variables)
// and has a text alternative (role="img" + aria-label) and hover titles.

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n))

// ── Sparkline ────────────────────────────────
export function Sparkline({ data = [], color = '#059669', height = 38, label = 'trend' }) {
  const id = useId()
  const vals = data.filter(v => v !== null && v !== undefined)
  if (vals.length < 2) return <div style={{ height }} aria-hidden="true" />
  const min = Math.min(...vals), max = Math.max(...vals)
  const span = max - min || 1
  const W = 100, H = 36
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - 3 - (((v ?? min) - min) / span) * (H - 8)
  ])
  const line = pts.map(p => p.join(',')).join(' ')
  const area = `0,${H} ${line} ${W},${H}`
  const last = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height, display: 'block', overflow: 'visible' }} role="img" aria-label={label}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${id})`} />
      <polyline points={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {/* a zero-length round-capped line = a perfectly round dot even though the chart stretches */}
      <line x1={last[0]} y1={last[1]} x2={last[0] + 0.001} y2={last[1]} stroke={color} strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// ── Progress ring (health score etc.) ────────
export function Ring({ value = 0, size = 150, stroke = 12, color = '#10B981', track = 'rgba(255,255,255,.18)', children, label }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  const v = clamp(value, 0, 100)
  return (
    <div style={{ position: 'relative', width: size, height: size }} role="img" aria-label={label || `${v} out of 100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} style={{ stroke: track }} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  )
}

// ── Line / area chart with hover read-out ────
// points: [{ label, value (0-100 or null), title }]
export function AreaLine({ points = [], color = '#059669', height = 200, yMax = 100, format = (v) => `${v}%`, ariaLabel = 'trend chart' }) {
  const id = useId()
  const [hover, setHover] = useState(null)
  const W = 600, H = height, padL = 34, padR = 12, padT = 14, padB = 28
  const n = points.length
  if (n === 0) return null
  const x = (i) => padL + (n === 1 ? (W - padL - padR) / 2 : (i / (n - 1)) * (W - padL - padR))
  const y = (v) => padT + (1 - clamp(v, 0, yMax) / yMax) * (H - padT - padB)
  const valid = points.map((p, i) => (p.value === null || p.value === undefined ? null : [x(i), y(p.value), i]))
  const segs = valid.filter(Boolean)
  const line = segs.map(p => `${p[0]},${p[1]}`).join(' ')
  const area = segs.length > 1 ? `${segs[0][0]},${H - padB} ${line} ${segs[segs.length - 1][0]},${H - padB}` : ''
  const every = Math.ceil(n / 8)
  const h = hover !== null ? points[hover] : null
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 520, height: 'auto', display: 'block' }} role="img" aria-label={ariaLabel} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.30" /><stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map(g => {
          const gv = (g / 100) * yMax
          return (
            <g key={g}>
              <line x1={padL} x2={W - padR} y1={y(gv)} y2={y(gv)} stroke="var(--border)" strokeDasharray="3 4" />
              <text x={padL - 6} y={y(gv) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{format(Math.round(gv))}</text>
            </g>
          )
        })}
        {area && <polygon points={area} fill={`url(#${id})`} />}
        {segs.length > 1 && <polyline points={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
        {points.map((p, i) => (
          <g key={i}>
            {i % every === 0 || i === n - 1 ? <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{p.label}</text> : null}
            {valid[i] && (
              <circle cx={valid[i][0]} cy={valid[i][1]} r={hover === i ? 5.5 : 3.5} fill="var(--surface)" stroke={color} strokeWidth="2.5">
                <title>{p.title || `${p.label}: ${format(p.value)}`}</title>
              </circle>
            )}
            <rect x={x(i) - (W - padL - padR) / (2 * Math.max(1, n - 1))} y={padT} width={(W - padL - padR) / Math.max(1, n - 1)} height={H - padT - padB}
              fill="transparent" onMouseEnter={() => setHover(i)} />
          </g>
        ))}
        {hover !== null && valid[hover] && <line x1={valid[hover][0]} x2={valid[hover][0]} y1={padT} y2={H - padB} stroke={color} strokeOpacity=".35" />}
      </svg>
      </div>
      {h && (
        <div style={{
          position: 'absolute', top: 0, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          padding: '6px 10px', fontSize: 12, boxShadow: '0 6px 20px rgba(0,0,0,.12)', pointerEvents: 'none'
        }}>{h.title || `${h.label}: ${format(h.value)}`}</div>
      )}
    </div>
  )
}

// ── Grouped bars (income vs expenses ...) ────
// data: [{ label, a, b }]
export function GroupedBars({ data = [], colorA = '#059669', colorB = '#F59E0B', fmtAxis = (v) => v, fmtTip = (v) => v, nameA = 'A', nameB = 'B', height = 220 }) {
  const W = 600, H = height, padL = 44, padR = 8, padT = 14, padB = 26
  const max = Math.max(1, ...data.flatMap(d => [d.a, d.b]))
  // Round the top of the scale up to a tidy number whose quarters are clean (e.g. 24K → 6K / 12K / 18K / 24K).
  const nice = (() => { const p = Math.pow(10, Math.floor(Math.log10(max))); const f = max / p; return ([1, 1.2, 1.6, 2, 2.4, 3, 4, 5, 6, 8, 10].find(s => s >= f) || 10) * p })()
  const gw = (W - padL - padR) / Math.max(1, data.length)
  const bw = Math.min(26, gw / 3)
  const y = (v) => padT + (1 - v / nice) * (H - padT - padB)
  return (
    <div style={{ overflowX: 'auto' }}>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 520, height: 'auto', display: 'block' }} role="img" aria-label={`${nameA} versus ${nameB} by month`}>
      {[0, 0.25, 0.5, 0.75, 1].map(g => (
        <g key={g}>
          <line x1={padL} x2={W - padR} y1={y(nice * g)} y2={y(nice * g)} stroke="var(--border)" strokeDasharray="3 4" />
          <text x={padL - 6} y={y(nice * g) + 3} textAnchor="end" fontSize="9" fill="var(--text-muted)">{fmtAxis(nice * g)}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = padL + gw * i + gw / 2
        return (
          <g key={d.label}>
            <rect x={cx - bw - 2} y={y(d.a)} width={bw} height={Math.max(0, H - padB - y(d.a))} rx="4" fill={colorA}><title>{`${d.label} — ${nameA}: ${fmtTip(d.a)}`}</title></rect>
            <rect x={cx + 2} y={y(d.b)} width={bw} height={Math.max(0, H - padB - y(d.b))} rx="4" fill={colorB}><title>{`${d.label} — ${nameB}: ${fmtTip(d.b)}`}</title></rect>
            <text x={cx} y={H - 8} textAnchor="middle" fontSize="10" fill="var(--text-muted)">{d.label}</text>
          </g>
        )
      })}
    </svg>
    </div>
  )
}

// ── Donut ────────────────────────────────────
export function Donut({ parts = [], size = 150, stroke = 22, children, label = 'breakdown' }) {
  const total = parts.reduce((a, p) => a + p.value, 0)
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  let offset = 0
  return (
    <div style={{ position: 'relative', width: size, height: size }} role="img" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} opacity=".5" />
        {total > 0 && parts.map((p, i) => {
          const len = (p.value / total) * c
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={p.color} strokeWidth={stroke}
              strokeDasharray={`${Math.max(0, len - 2)} ${c - Math.max(0, len - 2)}`} strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}><title>{`${p.label}: ${p.tip || p.value}`}</title></circle>
          )
          offset += len
          return el
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  )
}

// ── Horizontal bars (age bands, funnel) ──────
export function HBars({ rows = [], max, color = '#059669', fmt = (v) => v }) {
  const m = max ?? Math.max(1, ...rows.map(r => r.value))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {rows.map(r => (
        <div key={r.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3, color: 'var(--text-secondary)' }}>
            <span>{r.label}</span><b style={{ color: 'var(--text-primary)' }}>{r.display ?? fmt(r.value)}</b>
          </div>
          <div style={{ height: 9, borderRadius: 999, background: 'var(--surface-2, rgba(148,163,184,.18))', overflow: 'hidden' }}>
            <div style={{ width: `${clamp((r.value / m) * 100, 0, 100)}%`, height: '100%', borderRadius: 999, background: r.color || color, transition: 'width 1s cubic-bezier(.2,.8,.2,1)' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
