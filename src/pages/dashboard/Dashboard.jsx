import { useEffect, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserPlus, CalendarCheck, Wallet, TrendingUp, TrendingDown, HandHeart, CalendarDays,
  ClipboardCheck, FileBarChart, RefreshCw, Phone, ArrowUpRight, ArrowDownRight, Sparkles, UserCheck, Gift, PiggyBank
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import useApi from '../../hooks/useApi'
import { formatMoney } from '../../utils/currency'
import { fmtDate } from '../../utils/dates'
import { Sparkline, Ring, AreaLine, GroupedBars, Donut, HBars } from '../../components/charts/Charts'
import CellDashboard from './CellDashboard'

// ─────────────────────────────────────────────────────────────
// Command Center — the pastor's morning briefing.
// One request (/dashboard/overview) powers everything. All dates and
// "this month / this week" are the CHURCH's calendar, computed server-side.
// Sections the user's role may not see arrive as null and are not drawn.
// ─────────────────────────────────────────────────────────────

const PALETTE = ['#0F4A3C', '#C9973F', '#10B981', '#EC4899', '#06B6D4', '#F97316', '#8B5CF6', '#64748B']
const TONE = { good: '#059669', warn: '#D97706', alert: '#DC2626', info: '#2563EB' }

const compact   = (v) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(v)
const monthLbl  = (key) => fmtDate(`${key}-01T00:00:00.000Z`, { month: 'short' })
const shortDay  = (iso) => fmtDate(iso, { month: 'short', day: 'numeric' })
const titleCase = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
const initials  = (n = '') => n.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const telHref   = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`
const when      = (n, ongoing) => (ongoing ? 'Happening now' : n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`)

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000)
  if (s < 60) return 'Just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`
  return fmtDate(date, { day: 'numeric', month: 'short' })
}

const CSS = `
.cc{display:flex;flex-direction:column;gap:18px;max-width:1280px;margin:0 auto}
.cc *{box-sizing:border-box}
@keyframes cc-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes cc-shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
@keyframes cc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.cc-in{animation:cc-rise .55s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--i,0)*70ms)}
.cc-hero{position:relative;overflow:hidden;border-radius:22px;padding:26px 28px;color:var(--text-primary);background:radial-gradient(900px 260px at 100% 0%,color-mix(in srgb,var(--primary,#4F46E5) 10%,transparent),transparent 70%),var(--surface);border:1px solid var(--border);display:grid;grid-template-columns:1fr auto;gap:22px;align-items:center}
.cc-hero>*{position:relative;z-index:1}
.cc-eyebrow{font-size:.74rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted);font-weight:700}
.cc-hello{font-size:clamp(1.5rem,3.2vw,2.15rem);font-weight:800;margin:4px 0 2px;line-height:1.15;color:var(--text-primary)}
.cc-sub{color:var(--text-secondary,var(--text-muted));font-size:.95rem;margin:0}
.cc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.cc-act{display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-primary);font-size:.82rem;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}
.cc-act:hover{border-color:var(--primary,#4F46E5);transform:translateY(-1px)}
.cc-act.primary{background:var(--primary,#4F46E5);color:#fff;border-color:var(--primary,#4F46E5)}
.cc-act.primary:hover{filter:brightness(1.08)}
.cc-pulse{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:16px 22px;border-radius:18px;background:var(--surface-2);border:1px solid var(--border)}
.cc-pulse b{font-size:2.5rem;line-height:1;color:var(--text-primary)}.cc-pulse small{font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:var(--text-muted)}
.cc-pulse .tag{display:inline-flex;align-items:center;gap:6px;font-size:.78rem;font-weight:800;padding:3px 12px;border-radius:999px;color:var(--text-primary);background:color-mix(in srgb,var(--pc) 16%,transparent)}
.cc-pulse .tag::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--pc)}
.cc-brief{display:flex;gap:10px;flex-wrap:wrap}
@media (max-width:700px){.cc-brief{flex-wrap:nowrap;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}}
.cc-chip{flex:0 0 auto;display:flex;align-items:center;gap:10px;max-width:340px;padding:10px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--border);border-left:4px solid var(--tone);cursor:pointer;text-align:left;font:inherit;color:var(--text-primary);transition:transform .15s,box-shadow .15s}
.cc-chip:hover{transform:translateY(-2px);box-shadow:0 8px 22px rgba(15,23,42,.1)}
.cc-chip .em{font-size:1.25rem}.cc-chip span.t{font-size:.84rem;line-height:1.3;font-weight:600}
.cc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:14px}
.cc-kpi{position:relative;display:flex;flex-direction:column;gap:2px;padding:16px;border-radius:18px;background:var(--surface);border:1px solid var(--border);text-align:left;font:inherit;color:var(--text-primary);cursor:pointer;overflow:hidden;transition:transform .18s,box-shadow .18s,border-color .18s}
.cc-kpi:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(15,23,42,.12);border-color:var(--accent)}
.cc-kpi::before{content:"";position:absolute;left:0;top:0;right:0;height:3px;background:var(--accent)}
.cc-kpi .top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.cc-kpi .ic{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--accent) 14%,transparent);color:var(--accent)}
.cc-kpi .lab{font-size:.72rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);margin-top:8px}
.cc-kpi .val{font-size:1.85rem;font-weight:800;line-height:1.15;letter-spacing:-.02em}
.cc-kpi .note{font-size:.76rem;color:var(--text-muted);margin-bottom:6px;min-height:1.1em}
.cc-delta{display:inline-flex;align-items:center;gap:3px;font-size:.72rem;font-weight:800;padding:2px 8px;border-radius:999px}
.cc-delta.up{background:rgba(16,185,129,.14);color:#047857}.cc-delta.down{background:rgba(239,68,68,.13);color:#B91C1C}
.cc-grid2{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(0,1fr);gap:16px}
.cc-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}
.cc-card{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px;min-width:0}
.cc-card h3{margin:0;font-size:.98rem;font-weight:800;color:var(--text-primary)}
.cc-card .sub{margin:2px 0 12px;font-size:.76rem;color:var(--text-muted)}
.cc-head{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.cc-link{background:none;border:0;color:var(--primary);font:inherit;font-size:.78rem;font-weight:700;cursor:pointer;padding:0;white-space:nowrap}
.cc-link:hover{text-decoration:underline}
.cc-legend{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:.76rem;color:var(--text-secondary);margin-top:8px}
.cc-legend i{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:5px}
.cc-donutwrap{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.cc-bignum{font-size:1.3rem;font-weight:800;line-height:1.1;color:var(--text-primary)}.cc-small{font-size:.66rem;text-transform:uppercase;letter-spacing:.07em;color:var(--text-muted)}
.cc-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin-top:14px}
.cc-stat{padding:10px 12px;border-radius:12px;background:var(--surface-2,rgba(148,163,184,.12));}
.cc-stat b{display:block;font-size:1.05rem;color:var(--text-primary)}.cc-stat span{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em}
.cc-bar{height:10px;border-radius:999px;background:var(--surface-2,rgba(148,163,184,.2));overflow:hidden}
.cc-bar i{display:block;height:100%;border-radius:999px;background:var(--primary);transition:width 1.1s cubic-bezier(.2,.8,.2,1)}
.cc-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.cc-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)}.cc-row:last-child{border-bottom:0}
.cc-av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:.76rem;font-weight:800;color:#fff;flex:0 0 36px}
.cc-row .main{flex:1;min-width:0}.cc-row .nm{font-weight:700;font-size:.88rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-row .meta{font-size:.74rem;color:var(--text-muted)}
.cc-streak{font-size:.72rem;font-weight:800;padding:2px 9px;border-radius:999px;background:rgba(239,68,68,.13);color:#B91C1C;white-space:nowrap}
.cc-call{display:inline-flex;align-items:center;gap:4px;color:var(--primary);font-size:.78rem;font-weight:700;text-decoration:none}
.cc-when{font-size:.7rem;font-weight:800;padding:3px 9px;border-radius:999px;white-space:nowrap;background:var(--surface-2,rgba(148,163,184,.16));color:var(--text-secondary)}
.cc-when.soon{background:rgba(245,158,11,.16);color:#B45309}.cc-when.now{background:rgba(16,185,129,.16);color:#047857}
.cc-dot{width:10px;height:10px;border-radius:50%;flex:0 0 10px;margin:0 4px}
.cc-empty{padding:22px 10px;text-align:center;color:var(--text-muted);font-size:.86rem}
.cc-skel{border-radius:16px;min-height:120px;background:linear-gradient(90deg,var(--surface-2,#eef2f7) 25%,var(--surface,#fff) 50%,var(--surface-2,#eef2f7) 75%);background-size:800px 100%;animation:cc-shimmer 1.4s infinite linear}
.cc-err{padding:16px;border-radius:14px;background:rgba(239,68,68,.1);color:#B91C1C;font-weight:600;display:flex;gap:12px;align-items:center;justify-content:space-between}
.cc-foot{font-size:.72rem;color:var(--text-muted);text-align:center;padding:4px}
@media (max-width:900px){.cc-hero{grid-template-columns:1fr}.cc-pulse{flex-direction:row;justify-content:flex-start}.cc-grid2{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.cc-in,.cc-hero::before{animation:none}.cc-kpi,.cc-chip,.cc-act{transition:none}}
`

// ── animated number ───────────────────────────
function CountUp({ value, format = (v) => Math.round(v).toLocaleString(), ms = 900 }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof requestAnimationFrame !== 'function' || !Number.isFinite(value)) { setShown(value); return undefined }   // eslint-disable-line react-hooks/set-state-in-effect
    let raf; const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / ms)
      setShown(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, ms])
  return <>{format(Number.isFinite(shown) ? shown : value)}</>
}

// ── the briefing: plain-language insights, most important first ──
const buildInsights = (ov) => {
  const out = []
  const cur = ov.meta.currency
  const m = (v) => formatMoney(v, cur, { decimals: 0 })
  const names = (arr) => arr.slice(0, 2).map(b => b.name.split(' ')[0]).join(' & ') + (arr.length > 2 ? ` +${arr.length - 2}` : '')

  const bToday = ov.birthdays.upcoming.filter(b => b.daysUntil === 0)
  if (bToday.length) out.push({ em: '🎂', tone: 'info', text: `${bToday.length === 1 ? '1 birthday' : `${bToday.length} birthdays`} today — ${names(bToday)}`, to: '/events' })
  if (ov.care && ov.care.count > 0) out.push({ em: '🤝', tone: 'alert', text: `${ov.care.count} member${ov.care.count === 1 ? ' has' : 's have'} missed 3+ services in a row`, to: '/reports' })
  const tr = ov.attendance.trend
  if (tr !== null && tr >= 3) out.push({ em: '📈', tone: 'good', text: `Attendance is up ${tr} pts over the last 3 services`, to: '/reports' })
  if (tr !== null && tr <= -3) out.push({ em: '📉', tone: 'warn', text: `Attendance is down ${Math.abs(tr)} pts over the last 3 services`, to: '/reports' })
  if (ov.finance) {
    const v = ov.finance.vsLastMonthPct
    if (v !== null && v >= 5) out.push({ em: '💚', tone: 'good', text: `Giving is ${v}% ahead of last month (same days)`, to: '/finance' })
    if (v !== null && v <= -10) out.push({ em: '⚠️', tone: 'warn', text: `Giving is ${Math.abs(v)}% behind last month (same days)`, to: '/finance' })
    if (ov.finance.pledges.overdue > 0) out.push({ em: '🧾', tone: 'warn', text: `${ov.finance.pledges.overdue} overdue pledge${ov.finance.pledges.overdue === 1 ? '' : 's'} — ${m(ov.finance.pledges.outstanding)} outstanding`, to: '/pledges' })
  }
  if (ov.visitors.pendingOver3Days > 0) out.push({ em: '🙋', tone: 'warn', text: `${ov.visitors.pendingOver3Days} first-time visitor${ov.visitors.pendingOver3Days === 1 ? ' has' : 's have'} waited 3+ days for a follow-up`, to: '/visitors' })
  const ev = ov.events.find(e => !e.ongoing && e.daysUntil <= 7) || ov.events.find(e => e.ongoing)
  if (ev) out.push({ em: '📅', tone: 'info', text: `${ev.title} — ${when(ev.daysUntil, ev.ongoing).toLowerCase()}`, to: '/events' })
  if (ov.members.newThisMonth > 0) out.push({ em: '🌱', tone: 'good', text: `${ov.members.newThisMonth} new member${ov.members.newThisMonth === 1 ? '' : 's'} joined this month`, to: '/members' })
  if (out.length === 0) out.push({ em: '✨', tone: 'good', text: 'All quiet — nothing needs your attention right now.', to: '/reports' })
  // Most urgent first (alerts, then warnings, then heads-ups, then good news); stable within a tone.
  const rank = { alert: 0, warn: 1, info: 2, good: 3 }
  return out.map((x, i) => ({ ...x, i })).sort((a, b) => rank[a.tone] - rank[b.tone] || a.i - b.i).slice(0, 6)
}

function Delta({ value, suffix = '%', invert = false }) {
  if (value === null || value === undefined || value === 0) return null
  const up = invert ? value < 0 : value > 0
  return <span className={`cc-delta ${up ? 'up' : 'down'}`}>{value > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{Math.abs(value)}{suffix}</span>
}

function Kpi({ i, accent, icon: Icon, label, value, format, note, delta, deltaSuffix, spark, onClick }) {
  return (
    <button className="cc-kpi cc-in" style={{ '--i': i, '--accent': accent }} onClick={onClick}>
      <div className="top"><span className="ic"><Icon size={18} /></span>{delta !== undefined && <Delta value={delta} suffix={deltaSuffix} />}</div>
      <span className="lab">{label}</span>
      <span className="val">{typeof value === 'number' ? <CountUp value={value} format={format} /> : value}</span>
      <span className="note">{note}</span>
      {spark ? <Sparkline data={spark} color={accent} label={`${label} trend`} /> : <div style={{ height: 38 }} aria-hidden="true" />}
    </button>
  )
}

// ── the view (pure: everything arrives as props) ──
export function DashboardView({ ov, activity, user, navigate, onRefresh }) {
  const { meta } = ov
  const cur = meta.currency
  const m0 = (v) => formatMoney(v, cur, { decimals: 0 })
  const m2 = (v) => formatMoney(v, cur, { decimals: 2 })
  const insights = useMemo(() => buildInsights(ov), [ov])
  const h = meta.hour
  const greeting = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const score = ov.health.score
  const pulse = score >= 75 ? { c: '#34D399', t: 'Thriving' } : score >= 50 ? { c: '#FBBF24', t: 'Steady' } : { c: '#FB7185', t: 'Needs care' }
  const f = ov.finance
  const att = ov.attendance
  const mem = ov.members
  const vis = ov.visitors
  // Quick actions follow the user's permissions (the server enforces them too).
  const has = (p) => !!user?.permissions?.includes(p)
  const generated = new Date(meta.generatedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone: meta.timezone })

  const timeline = [
    ...ov.events.map(e => ({ key: 'e' + e.id, d: e.ongoing ? 0 : e.daysUntil, label: e.title, sub: [e.startTime, e.location].filter(Boolean).join(' · ') || titleCase(e.type || 'event'), color: e.color, ongoing: e.ongoing, kind: 'event' })),
    ...ov.birthdays.upcoming.map(b => ({ key: 'b' + b.id, d: b.daysUntil, label: b.name, sub: b.turning ? `Turning ${b.turning}` : 'Birthday', color: '#EC4899', kind: 'birthday' })),
  ].sort((a, b) => a.d - b.d).slice(0, 9)

  const funnel = [
    { label: 'Visitors (90 days)', value: vis.total, color: '#0EA5E9' },
    { label: 'Contacted', value: vis.contacted + vis.visited + vis.converted, color: '#06B6D4' },
    { label: 'Visited again', value: vis.visited + vis.converted, color: '#10B981' },
    { label: 'Became members', value: vis.converted, color: '#F59E0B' },
  ].map(r => ({ ...r, display: `${r.value}${vis.total ? ` · ${Math.round((r.value / vis.total) * 100)}%` : ''}` }))

  const genderTotal = mem.gender.male + mem.gender.female + mem.gender.unspecified

  return (
    <div className="cc">
      <style>{CSS}</style>

      {/* HERO */}
      <section className="cc-hero cc-in" style={{ '--i': 0 }}>
        <div>
          <div className="cc-eyebrow">{fmtDate(`${meta.today}T00:00:00.000Z`, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <h1 className="cc-hello">{greeting}, {user?.name?.split(' ')[0] || 'friend'} 👋</h1>
          <p className="cc-sub">{meta.churchName || user?.churchName} · here is your church at a glance.</p>
          <div className="cc-actions">
            {has('members.create') && <button className="cc-act primary" onClick={() => navigate('/members')}><UserPlus size={15} /> Add member</button>}
            {has('attendance.view') && <button className="cc-act" onClick={() => navigate('/attendance')}><ClipboardCheck size={15} /> Take attendance</button>}
            {meta.canFinance && <button className="cc-act" onClick={() => navigate('/finance')}><Wallet size={15} /> Record giving</button>}
            {has('events.manage') && <button className="cc-act" onClick={() => navigate('/events')}><CalendarDays size={15} /> New event</button>}
            {(has('reports.view') || has('reports.finance')) && <button className="cc-act" onClick={() => navigate('/reports')}><FileBarChart size={15} /> Reports</button>}
          </div>
        </div>
        <div className="cc-pulse" title="Church Pulse = attendance 35% + giving participation 25% + member growth 20% + active members 20%">
          <Ring value={score} size={136} stroke={11} color={pulse.c} track="var(--border)" label={`Church pulse ${score} out of 100, ${pulse.t}`}>
            <b><CountUp value={score} /></b><small>Pulse</small>
          </Ring>
          <span className="tag" style={{ '--pc': pulse.c }}>{pulse.t}</span>
        </div>
      </section>

      {/* BRIEFING */}
      <section aria-label="Today's briefing">
        <div className="cc-eyebrow" style={{ color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Sparkles size={13} /> Today's briefing</div>
        <div className="cc-brief">
          {insights.map((x, i) => (
            <button key={i} className="cc-chip cc-in" style={{ '--tone': TONE[x.tone], '--i': i + 1 }} onClick={() => navigate(x.to)}>
              <span className="em" aria-hidden="true">{x.em}</span><span className="t">{x.text}</span>
            </button>
          ))}
        </div>
      </section>

      {/* KPI TILES */}
      <section className="cc-kpis">
        <Kpi i={1} accent="#0EA5E9" icon={Users} label="Members" value={mem.total}
          note={`${mem.active} active · ${mem.inactive} inactive`} delta={mem.newThisMonth > 0 ? mem.newThisMonth : undefined} deltaSuffix=" new"
          spark={mem.growth.map(g => g.total)} onClick={() => navigate('/members')} />
        <Kpi i={2} accent="#10B981" icon={CalendarCheck} label="Attendance" value={att.latest && att.latest.rate !== null ? att.latest.rate : '—'} format={(v) => `${Math.round(v)}%`}
          note={att.latest ? `${att.latest.present} at ${att.latest.name}` : 'No services recorded yet'} delta={att.trend ?? undefined} deltaSuffix=" pts"
          spark={att.series.map(s => s.rate)} onClick={() => navigate('/reports')} />
        {f ? (
          <Kpi i={3} accent="#F59E0B" icon={Wallet} label="Giving this month" value={f.thisMonth} format={m0}
            note={f.vsLastMonthPct !== null ? 'vs same days last month' : `${f.giftCount} gifts so far`} delta={f.vsLastMonthPct ?? undefined}
            spark={f.weekly.map(w => w.income)} onClick={() => navigate('/finance')} />
        ) : (
          <Kpi i={3} accent="#F59E0B" icon={UserCheck} label="Active members" value={mem.active} note={`${mem.new_convert} new converts`} onClick={() => navigate('/members')} />
        )}
        {f ? (
          <Kpi i={4} accent={f.netThisMonth >= 0 ? '#059669' : '#DC2626'} icon={f.netThisMonth >= 0 ? TrendingUp : TrendingDown} label="Net this month" value={f.netThisMonth} format={m0}
            note={`${m0(f.thisMonth)} in · ${m0(f.expensesThisMonth)} out`} spark={f.monthly.map(x => x.income - x.expenses)} onClick={() => navigate('/finance')} />
        ) : null}
        <Kpi i={5} accent="#EC4899" icon={HandHeart} label="Visitors · 90 days" value={vis.total}
          note={vis.conversionPct !== null ? `${vis.conversionPct}% became members` : 'No visitors yet'} onClick={() => navigate('/visitors')} />
      </section>

      {/* GIVING */}
      {f && (
        <section className="cc-grid2">
          <div className="cc-card cc-in" style={{ '--i': 6 }}>
            <div className="cc-head"><div><h3>Giving vs spending</h3><p className="sub">Last 6 months · {m0(f.ytd)} given so far this year</p></div><button className="cc-link" onClick={() => navigate('/finance')}>Open finance →</button></div>
            <GroupedBars data={f.monthly.map(x => ({ label: monthLbl(x.month), a: x.income, b: x.expenses }))} nameA="Giving" nameB="Spending"
              colorA="#059669" colorB="#F59E0B" fmtAxis={(v) => compact(v)} fmtTip={m0} />
            <div className="cc-legend"><span><i style={{ background: '#059669' }} />Giving</span><span><i style={{ background: '#F59E0B' }} />Spending</span></div>
            <div className="cc-stats">
              <div className="cc-stat"><b>{f.givers}</b><span>Givers this month</span></div>
              <div className="cc-stat"><b>{f.participationPct === null ? '—' : `${f.participationPct}%`}</b><span>Participation</span></div>
              <div className="cc-stat"><b>{m0(f.averageGift)}</b><span>Average gift</span></div>
              <div className="cc-stat"><b>{f.giftCount}</b><span>Gifts</span></div>
            </div>
          </div>
          <div className="cc-card cc-in" style={{ '--i': 7 }}>
            <h3>Where giving goes</h3><p className="sub">This month, by fund</p>
            {f.byType.length === 0 ? <div className="cc-empty">No giving recorded this month yet.</div> : (
              <div className="cc-donutwrap">
                <Donut size={150} stroke={18} label="Giving by fund this month" parts={f.byType.map((t, i) => ({ label: titleCase(t.type), value: t.amount, color: PALETTE[i % PALETTE.length], tip: m2(t.amount) }))}>
                  <span className="cc-bignum" style={{ fontSize: '1.05rem' }}>{m0(f.thisMonth)}</span><span className="cc-small">this month</span>
                </Donut>
                <div className="cc-legend" style={{ flexDirection: 'column', gap: 6, marginTop: 0 }}>
                  {f.byType.slice(0, 6).map((t, i) => <span key={t.type}><i style={{ background: PALETTE[i % PALETTE.length] }} />{titleCase(t.type)} — <b>{m0(t.amount)}</b></span>)}
                </div>
              </div>
            )}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 6 }}>
                <span style={{ display: 'flex', gap: 6, alignItems: 'center', fontWeight: 700 }}><PiggyBank size={15} /> Pledges</span>
                <span style={{ color: 'var(--text-muted)' }}>{f.pledges.pct === null ? 'none open' : `${f.pledges.pct}% fulfilled`}</span>
              </div>
              <div className="cc-bar"><i style={{ width: `${f.pledges.pct || 0}%` }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.74rem', color: 'var(--text-muted)', marginTop: 6 }}>
                <span>{m0(f.pledges.paid)} paid of {m0(f.pledges.pledged)}</span>
                {f.pledges.overdue > 0 && <button className="cc-link" style={{ color: '#B91C1C' }} onClick={() => navigate('/pledges')}>{f.pledges.overdue} overdue</button>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ATTENDANCE + CARE */}
      <section className="cc-grid2">
        <div className="cc-card cc-in" style={{ '--i': 8 }}>
          <div className="cc-head"><div><h3>Attendance rhythm</h3><p className="sub">Last {att.series.length || 0} services · average {att.avgRate === null ? '—' : `${att.avgRate}%`}{att.best ? ` · best: ${att.best.name} (${att.best.rate}%)` : ''}</p></div><button className="cc-link" onClick={() => navigate('/reports')}>Open register →</button></div>
          {att.series.length < 2 ? <div className="cc-empty">Record attendance for a couple of services to see the trend.</div> : (
            <AreaLine color="#10B981" ariaLabel="Attendance rate by service" points={att.series.map(s => ({ label: shortDay(s.date), value: s.rate, title: `${s.name} · ${shortDay(s.date)} — ${s.rate === null ? 'n/a' : `${s.rate}%`} (${s.present} present)` }))} />
          )}
        </div>
        <div className="cc-card cc-in" style={{ '--i': 9 }}>
          <div className="cc-head"><div><h3>Members to follow up</h3><p className="sub">{meta.canCare ? 'Missed 3+ services in a row' : 'Visible to church leadership'}</p></div></div>
          {!ov.care ? <div className="cc-empty">🔒 Member care lists are available to pastors and administrators.</div>
            : ov.care.members.length === 0 ? <div className="cc-empty">🎉 Nobody has missed 3 or more services in a row.</div> : (
              <>
                <ul className="cc-list">
                  {ov.care.members.map((p, i) => (
                    <li className="cc-row" key={p.id}>
                      <span className="cc-av" style={{ background: PALETTE[i % PALETTE.length] }}>{initials(p.name)}</span>
                      <div className="main"><div className="nm">{p.name}</div><div className="meta">{p.lastAttended ? `Last seen ${shortDay(p.lastAttended)}` : 'Not seen recently'}</div></div>
                      <span className="cc-streak">{p.streak} missed</span>
                      {p.phone && <a className="cc-call" href={telHref(p.phone)} aria-label={`Call ${p.name}`}><Phone size={14} /></a>}
                    </li>
                  ))}
                </ul>
                {ov.care.count > ov.care.members.length && <button className="cc-link" style={{ marginTop: 8 }} onClick={() => navigate('/reports')}>+{ov.care.count - ov.care.members.length} more in the register →</button>}
              </>
            )}
        </div>
      </section>

      {/* UPCOMING + FUNNEL + PEOPLE */}
      <section className="cc-grid3">
        <div className="cc-card cc-in" style={{ '--i': 10 }}>
          <div className="cc-head"><div><h3>Coming up</h3><p className="sub">Events &amp; birthdays · next 14 days</p></div><button className="cc-link" onClick={() => navigate('/events')}>Calendar →</button></div>
          {timeline.length === 0 ? <div className="cc-empty">Nothing scheduled in the next two weeks.</div> : (
            <ul className="cc-list">
              {timeline.map(t => (
                <li className="cc-row" key={t.key}>
                  <span className="cc-dot" style={{ background: t.color }} aria-hidden="true" />
                  <div className="main"><div className="nm">{t.kind === 'birthday' ? '🎂 ' : ''}{t.label}</div><div className="meta">{t.sub}</div></div>
                  <span className={`cc-when ${t.ongoing ? 'now' : t.d <= 1 ? 'soon' : ''}`}>{when(t.d, t.ongoing)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cc-card cc-in" style={{ '--i': 11 }}>
          <div className="cc-head"><div><h3>Visitor journey</h3><p className="sub">From first visit to membership</p></div><button className="cc-link" onClick={() => navigate('/visitors')}>Visitors →</button></div>
          {vis.total === 0 ? <div className="cc-empty">No visitors recorded in the last 90 days.</div> : (
            <>
              <HBars rows={funnel} max={Math.max(1, vis.total)} />
              {vis.pendingOver3Days > 0 && <p style={{ margin: '14px 0 0', fontSize: '.8rem', color: '#B45309', fontWeight: 700 }}>⏱ {vis.pendingOver3Days} waiting for first contact 3+ days</p>}
            </>
          )}
        </div>

        <div className="cc-card cc-in" style={{ '--i': 12 }}>
          <h3>Who is in the church</h3><p className="sub">Age groups · {mem.total} members</p>
          <HBars rows={mem.ageBands.map(b => ({ label: `${b.label} (${b.key})`, value: b.count }))} color="#059669" />
          {mem.ageUnknown > 0 && <p className="cc-small" style={{ marginTop: 8 }}>{mem.ageUnknown} without a birth date</p>}
          {genderTotal > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden' }} role="img" aria-label={`${mem.gender.female} women, ${mem.gender.male} men`}>
                <div style={{ width: `${(mem.gender.female / genderTotal) * 100}%`, background: '#EC4899' }} />
                <div style={{ width: `${(mem.gender.male / genderTotal) * 100}%`, background: '#3B82F6' }} />
                <div style={{ flex: 1, background: 'rgba(148,163,184,.4)' }} />
              </div>
              <div className="cc-legend"><span><i style={{ background: '#EC4899' }} />Women {mem.gender.female}</span><span><i style={{ background: '#3B82F6' }} />Men {mem.gender.male}</span></div>
            </div>
          )}
          {mem.topDepartments.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div className="cc-small" style={{ marginBottom: 6 }}>Largest departments</div>
              <HBars rows={mem.topDepartments.map((d, i) => ({ label: d.name, value: d.count, color: d.color || PALETTE[i % PALETTE.length] }))} />
            </div>
          )}
        </div>
      </section>

      {/* ACTIVITY */}
      {activity.length > 0 && (
        <section className="cc-card cc-in" style={{ '--i': 13 }}>
          <div className="cc-head"><div><h3>Recent activity</h3><p className="sub">What has happened across the church lately</p></div></div>
          <ul className="cc-list">
            {activity.map((a, i) => {
              const Icon = { member: UserPlus, offering: Gift, expense: Wallet, attendance: CalendarCheck }[a.type] || Sparkles
              const color = { member: '#0EA5E9', offering: '#10B981', expense: '#F59E0B', attendance: '#06B6D4' }[a.type] || '#64748B'
              return (
                <li className="cc-row" key={i}>
                  <span className="cc-av" style={{ background: color, borderRadius: 12 }}><Icon size={16} /></span>
                  <div className="main"><div className="nm" style={{ whiteSpace: 'normal', fontWeight: 600 }}>{a.text}</div><div className="meta">{timeAgo(a.time)}</div></div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="cc-foot">
        Updated {generated} ({meta.timezone.replace(/_/g, ' ')}) ·{' '}
        <button className="cc-link" onClick={onRefresh}><RefreshCw size={11} style={{ verticalAlign: -1 }} /> Refresh</button>
      </div>
    </div>
  )
}

// ── the connected page ──
export default function Dashboard() {
  const { user } = useAuth()
  const { api, branchReady } = useApi()
  const navigate = useNavigate()
  const [ov, setOv] = useState(null)
  const [activity, setActivity] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!branchReady) return
    setError('')
    try {
      const data = await api('/dashboard/overview')
      if (data?.success) setOv(data)
      else setError(data?.message || 'Unable to load the dashboard.')
    } catch { setError('Unable to load the dashboard. Please check your connection.') }
    finally { setLoading(false) }
    try {
      const a = await api('/dashboard/activity')
      if (a?.success) setActivity(a.activities || [])
    } catch { /* the feed is optional */ }
  }, [api, branchReady])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  if (error && !ov) {
    return <div className="cc"><style>{CSS}</style><div className="cc-err"><span>{error}</span><button className="cc-act primary" onClick={() => { setLoading(true); load() }}>Try again</button></div></div>
  }
  if (loading || !ov) {
    return (
      <div className="cc"><style>{CSS}</style>
        <div className="cc-skel" style={{ minHeight: 190, borderRadius: 22 }} />
        <div className="cc-kpis">{[0, 1, 2, 3].map(i => <div key={i} className="cc-skel" style={{ minHeight: 150 }} />)}</div>
        <div className="cc-grid2"><div className="cc-skel" style={{ minHeight: 300 }} /><div className="cc-skel" style={{ minHeight: 300 }} /></div>
      </div>
    )
  }
  // Cell leaders get their own, strictly cell-scoped dashboard.
  if (ov.meta?.isCell) return <CellDashboard ov={ov} user={user} navigate={navigate} onRefresh={load} />
  return <DashboardView ov={ov} activity={activity} user={user} navigate={navigate} onRefresh={load} />
}
