import { useState } from 'react'
import {
  Building2, Users, Wallet, Clock, TrendingUp, TrendingDown, AlertTriangle,
  CalendarClock, MessageSquare, Trophy, Zap, Percent, ArrowRight
} from 'lucide-react'
import { formatMoney } from '../../utils/currency'
import { fmtDate } from '../../utils/dates'

// ─────────────────────────────────────────────────────────────
// Platform owner overview: how the business is doing and what needs you today.
// Everything comes from GET /api/admin/platform/overview (no extra requests).
// ─────────────────────────────────────────────────────────────

const card = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', boxShadow: 'var(--shadow-sm)' }
const h3   = { fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }
const muted = { fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }

const daysLeft = (d) => Math.max(0, Math.ceil((new Date(d) - new Date()) / 86400000))
const when = (n) => (n === 0 ? 'today' : n === 1 ? 'tomorrow' : `in ${n} days`)
const ago = (d) => {
  const h = Math.floor((Date.now() - new Date(d)) / 3600000)
  return h < 1 ? 'just now' : h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

function Kpi({ icon: Icon, label, value, sub, color, trend }) {
  return (
    <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ width: 38, height: 38, borderRadius: 'var(--radius-md)', background: color + '18', display: 'grid', placeItems: 'center' }}>
          <Icon size={18} color={color} />
        </span>
        {trend !== undefined && trend !== null && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: trend >= 0 ? 'var(--success)' : 'var(--danger)' }}>
            {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}{trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, margin: '4px 0 0' }}>{value}</p>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 500, margin: 0 }}>{label}</p>
      {sub && <p style={{ ...muted, margin: 0 }}>{sub}</p>}
    </div>
  )
}

function Bars({ data, valueOf, format, color }) {
  const max = Math.max(1, ...data.map(valueOf))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 150, marginTop: 'var(--space-4)' }}>
      {data.map((d, i) => {
        const v = valueOf(d)
        return (
          <div key={d.key} title={`${d.label}: ${format(v)}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{v > 0 ? format(v) : ''}</span>
            <div style={{ width: '100%', maxWidth: 44, height: `${Math.max(v > 0 ? 6 : 2, (v / max) * 100)}px`, background: i === data.length - 1 ? color : color + '88', borderRadius: 6 }} />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function Attention({ icon: Icon, color, title, count, children, empty }) {
  return (
    <div style={{ ...card, padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Icon size={16} color={color} />
        <h3 style={{ ...h3, fontSize: 'var(--text-sm)' }}>{title}</h3>
        {count > 0 && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 999, background: color + '22', color }}>{count}</span>}
      </div>
      {count === 0 ? <p style={{ ...muted, margin: 0 }}>{empty}</p> : children}
    </div>
  )
}

const Row = ({ left, sub, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderTop: '1px solid var(--border)' }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{left}</p>
      {sub && <p style={{ ...muted, margin: 0 }}>{sub}</p>}
    </div>
    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{right}</span>
  </div>
)

export default function PlatformOverview({ overview, formatMRR, onGoTab }) {
  const ins = overview.insights || {}
  const ch  = overview.churches || {}
  const currencies = Object.keys(ins.revenueSeries || {})
  const [cur, setCur] = useState(currencies.includes('GHS') ? 'GHS' : currencies[0] || 'GHS')
  const series = (ins.revenueSeries || {})[cur] || []
  const thisMonth = series[series.length - 1]?.total || 0
  const lastMonth = series[series.length - 2]?.total || 0
  const growth = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null
  const att = ins.attention || {}
  const planOrder = ['starter', 'growth', 'enterprise']
  const planTotal = planOrder.reduce((a, p) => a + (ins.plans?.[p] || 0), 0)
  const online = ins.methods?.paystack || 0
  const manual = ins.methods?.manual || 0
  const needsYou = (att.pendingPayments?.length || 0) + (att.trialsEnding?.length || 0) + (att.subscriptionsEnding?.length || 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 'var(--space-4)' }}>
        <Kpi icon={Building2} color="var(--primary)" label="Churches" value={ch.total} sub={`${ch.active} paying · ${ch.trial} on trial`} />
        <Kpi icon={Wallet} color="var(--accent, #D97706)" label="Monthly recurring revenue" value={formatMRR(overview)} sub="From active subscriptions" />
        <Kpi icon={Zap} color="var(--success)" label={`Collected this month${currencies.length > 1 ? ` (${cur})` : ''}`} value={formatMoney(thisMonth, cur)} trend={growth} sub={`Last month ${formatMoney(lastMonth, cur)}`} />
        <Kpi icon={Percent} color="var(--info)" label="Trial → paid" value={`${ins.conversionRate ?? 0}%`} sub={`${ins.payingChurches ?? 0} of ${ch.total} churches have paid`} />
        <Kpi icon={Users} color="var(--success)" label="Members on the platform" value={(overview.totalMembers || 0).toLocaleString()} />
        <Kpi icon={Clock} color={overview.pendingPayments > 0 ? 'var(--warning)' : 'var(--text-muted)'} label="Payments to approve" value={overview.pendingPayments} sub={overview.pendingPayments > 0 ? 'Waiting for your review' : 'All caught up'} />
      </div>

      {/* Needs your attention */}
      <div>
        <h3 style={{ ...h3, marginBottom: 'var(--space-3)' }}>
          Needs your attention {needsYou === 0 && <span style={{ ...muted, fontWeight: 500 }}> — nothing urgent 🎉</span>}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          <Attention icon={Clock} color="#D97706" title="Payments waiting" count={att.pendingPayments?.length || 0} empty="No payments waiting for approval.">
            {(att.pendingPayments || []).map(p => (
              <Row key={p._id} left={p.organizationId?.name || '—'} sub={`${p.reference} · ${ago(p.submittedAt || p.createdAt)}`} right={formatMoney(p.amount, p.currency || 'GHS')} />
            ))}
            <button className="btn-outline" style={{ marginTop: 8, fontSize: 12, padding: '5px 12px' }} onClick={() => onGoTab('payments')}>Review payments <ArrowRight size={12} /></button>
          </Attention>

          <Attention icon={CalendarClock} color="#2563EB" title="Trials ending in 7 days" count={att.trialsEnding?.length || 0} empty="No trials ending this week.">
            {(att.trialsEnding || []).map(o => (
              <Row key={o._id} left={o.name} sub={o.phone || o.email} right={when(daysLeft(o.subscriptionExpires))} />
            ))}
          </Attention>

          <Attention icon={AlertTriangle} color="#DC2626" title="Subscriptions renewing soon" count={att.subscriptionsEnding?.length || 0} empty="No paid plans expiring this week.">
            {(att.subscriptionsEnding || []).map(o => (
              <Row key={o._id} left={o.name} sub={`${o.subscriptionPlan} · ${o.phone || o.email}`} right={when(daysLeft(o.subscriptionExpires))} />
            ))}
          </Attention>

          <Attention icon={MessageSquare} color="#7C3AED" title="Low SMS credits" count={att.lowSms?.length || 0} empty="Every church has enough SMS credits.">
            {(att.lowSms || []).map(o => <Row key={o._id} left={o.name} right={`${o.smsCredits} left`} />)}
          </Attention>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={h3}>Revenue collected — last 6 months</h3>
            {currencies.length > 1 && (
              <select value={cur} onChange={e => setCur(e.target.value)} className="form-input" style={{ width: 'auto', padding: '2px 8px', fontSize: 12 }}>
                {currencies.map(c => <option key={c}>{c}</option>)}
              </select>
            )}
          </div>
          {currencies.length === 0
            ? <p style={{ ...muted, marginTop: 'var(--space-4)' }}>No approved payments yet. Revenue will appear here as churches pay.</p>
            : <Bars data={series} valueOf={d => d.total} format={v => formatMoney(v, cur)} color="var(--primary)" />}
        </div>

        <div style={card}>
          <h3 style={h3}>New churches — last 6 months</h3>
          <Bars data={ins.signups || []} valueOf={d => d.count} format={v => String(v)} color="var(--success)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        <div style={card}>
          <h3 style={{ ...h3, marginBottom: 'var(--space-3)' }}>Church status</h3>
          {[
            { label: 'Active (paying)', count: ch.active,    color: 'var(--success)' },
            { label: 'Trial',           count: ch.trial,     color: 'var(--info)' },
            { label: 'Expired',         count: ch.expired,   color: 'var(--warning)' },
            { label: 'Suspended',       count: ch.suspended, color: 'var(--danger)' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</span>
              <b style={{ fontSize: 'var(--text-sm)' }}>{count}</b>
              <span style={{ width: 70, height: 4, background: 'var(--surface-2)', borderRadius: 999 }}>
                <span style={{ display: 'block', height: '100%', width: `${ch.total ? (count / ch.total) * 100 : 0}%`, background: color, borderRadius: 999 }} />
              </span>
            </div>
          ))}
        </div>

        <div style={card}>
          <h3 style={{ ...h3, marginBottom: 'var(--space-3)' }}>Paying churches by plan</h3>
          {planTotal === 0 ? <p style={muted}>No paying churches yet.</p> : planOrder.map(pl => (
            <div key={pl} style={{ padding: '5px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{pl}</span>
                <b>{ins.plans?.[pl] || 0}</b>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 999, marginTop: 3 }}>
                <div style={{ height: '100%', width: `${((ins.plans?.[pl] || 0) / planTotal) * 100}%`, background: 'var(--primary)', borderRadius: 999 }} />
              </div>
            </div>
          ))}
          {(online + manual) > 0 && (
            <p style={{ ...muted, marginTop: 'var(--space-3)' }}>
              Payments: {online} online (Paystack) · {manual} manual
            </p>
          )}
        </div>

        <div style={card}>
          <h3 style={{ ...h3, marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 6 }}><Trophy size={15} color="#D97706" /> Biggest churches</h3>
          {(ins.topChurches || []).length === 0 ? <p style={muted}>No members yet.</p> : ins.topChurches.map((c, i) => (
            <Row key={c.id} left={`${i + 1}. ${c.name}`} right={`${c.members.toLocaleString()} members`} />
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ ...h3, marginBottom: 'var(--space-3)' }}>Recent approvals</h3>
        {(overview.recentApprovals || []).length === 0 ? <p style={muted}>No recent approvals.</p> : overview.recentApprovals.slice(0, 6).map(p => (
          <Row key={p._id} left={p.organizationId?.name || '—'} sub={`${p.reference} · ${p.method === 'paystack' ? 'Paystack' : 'Manual'} · ${fmtDate(p.reviewedAt, { day: 'numeric', month: 'short' })}`} right={formatMoney(p.amount, p.currency || 'GHS')} />
        ))}
      </div>
    </div>
  )
}
