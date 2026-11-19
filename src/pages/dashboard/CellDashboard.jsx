import { Users, CalendarCheck, HeartHandshake, ClipboardCheck, FileBarChart, Phone, RefreshCw, Cake, CalendarDays, UserCheck } from 'lucide-react'
import { fmtDate } from '../../utils/dates'

// ─────────────────────────────────────────────────────────────
// Cell Leader dashboard.
// Built from /dashboard/overview, which the server scopes to the leader's own
// cell group(s): members, attendance, follow-ups and birthdays below are ONLY
// for the people in those groups. No church-wide, finance or visitor data.
// ─────────────────────────────────────────────────────────────

const telHref = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`
const cap = (s = '') => s.charAt(0).toUpperCase() + s.slice(1)
const when = (n) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`)

const card = { background: 'var(--surface, #fff)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 14px)', padding: 18 }
const h3   = { fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }

function Kpi({ icon: Icon, label, value, note, color, onClick }) {
  return (
    <button onClick={onClick} style={{ ...card, textAlign: 'left', cursor: onClick ? 'pointer' : 'default', display: 'flex', gap: 14, alignItems: 'center' }}>
      <span style={{ width: 42, height: 42, borderRadius: 12, background: color + '1A', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} />
      </span>
      <span>
        <span style={{ display: 'block', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</span>
        {note && <span style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{note}</span>}
      </span>
    </button>
  )
}

export default function CellDashboard({ ov, user, navigate, onRefresh }) {
  const { meta, members, attendance: att, care, events } = ov
  const cells = ov.cells || []
  const h = meta.hour
  const greeting = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const series = att.series || []
  const maxPresent = Math.max(1, ...series.map(s => s.present))
  const birthdays = ov.birthdays?.upcoming || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <section style={{ ...card, padding: 24, background: 'var(--primary-light)', borderColor: 'transparent' }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(`${meta.today}T00:00:00.000Z`, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <h1 style={{ fontSize: 26, margin: '6px 0 4px', color: 'var(--text-primary)' }}>{greeting}, {user?.name?.split(' ')[0] || 'friend'} 👋</h1>
        {cells.length === 0 ? (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No cell group is assigned to you yet. Ask your church Super Admin to assign one.</p>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            You lead: {cells.map(c => c.name).join(' · ')}
            {cells.length === 1 && (c => (c.meetingDay || c.meetingLocation) ? ` — meets ${[c.meetingDay && cap(c.meetingDay), c.meetingTime, c.meetingLocation].filter(Boolean).join(', ')}` : '')(cells[0])}
          </p>
        )}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <button className="btn-primary" onClick={() => navigate('/attendance')}><ClipboardCheck size={15} /> Take attendance</button>
          <button className="btn-outline" style={{ background: 'var(--surface, #fff)' }} onClick={() => navigate('/reports')}><FileBarChart size={15} /> Cell report</button>
          <button className="btn-outline" style={{ background: 'var(--surface, #fff)' }} onClick={() => navigate('/members')}><Users size={15} /> My members</button>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14 }}>
        <Kpi icon={Users} color="#0EA5E9" label="Members in my cell" value={members.total} note={`${members.active} active · ${members.inactive} inactive`} onClick={() => navigate('/members')} />
        <Kpi icon={CalendarCheck} color="#10B981" label="Latest attendance" value={att.latest && att.latest.rate !== null ? `${att.latest.rate}%` : '—'}
          note={att.latest ? `${att.latest.present} of ${att.latest.expected} at ${att.latest.name}` : 'No services recorded yet'} onClick={() => navigate('/attendance')} />
        <Kpi icon={UserCheck} color="#F59E0B" label="Average attendance" value={att.avgRate !== null && att.avgRate !== undefined ? `${att.avgRate}%` : '—'} note={`Last ${series.length} service${series.length === 1 ? '' : 's'}`} />
        <Kpi icon={HeartHandshake} color={care && care.count > 0 ? '#DC2626' : '#059669'} label="Need a follow-up" value={care ? care.count : 0} note="Missed 3+ services in a row" onClick={() => navigate('/reports')} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        <div style={card}>
          <h3 style={h3}>Attendance — last {series.length || 0} services</h3>
          {series.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>Attendance for your cell will appear here once you take it.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, marginTop: 16 }}>
              {series.map(s => (
                <div key={s.id} title={`${s.name}: ${s.present} present`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.present}</span>
                  <div style={{ width: '100%', maxWidth: 34, height: `${Math.max(6, (s.present / maxPresent) * 90)}px`, background: 'var(--primary)', borderRadius: 6 }} />
                  <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{fmtDate(s.date, { month: 'short', day: 'numeric' })}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={h3}>Members to follow up</h3>
          {!care || care.members.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>🎉 Nobody in your cell has missed 3 or more services in a row.</p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {care.members.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Missed {p.streak} in a row{p.lastAttended ? ` · last seen ${fmtDate(p.lastAttended, { month: 'short', day: 'numeric' })}` : ''}</div>
                  </div>
                  {p.phone && <a href={telHref(p.phone)} className="btn-outline" style={{ padding: '6px 10px' }} title={`Call ${p.phone}`}><Phone size={14} /></a>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3 style={h3}>Coming up</h3>
          {events.length === 0 && birthdays.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>Nothing in the next two weeks.</p>
          ) : (
            <div style={{ marginTop: 10 }}>
              {events.slice(0, 4).map(e => (
                <div key={e.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0' }}>
                  <CalendarDays size={16} color={e.color} />
                  <span style={{ flex: 1, fontSize: 14 }}>{e.title}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.ongoing ? 'Now' : when(e.daysUntil)}</span>
                </div>
              ))}
              {birthdays.slice(0, 5).map(b => (
                <div key={b.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0' }}>
                  <Cake size={16} color="#EC4899" />
                  <span style={{ flex: 1, fontSize: 14 }}>{b.name}{b.turning ? ` turns ${b.turning}` : ''}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{when(b.daysUntil)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Showing only the members of your cell group{cells.length === 1 ? '' : 's'}. ·{' '}
        <button className="btn-ghost" style={{ padding: 0, fontSize: 12 }} onClick={onRefresh}><RefreshCw size={11} style={{ verticalAlign: -1 }} /> Refresh</button>
      </div>
    </div>
  )
}
