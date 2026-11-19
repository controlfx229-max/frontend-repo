import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Download, FileDown, Search, X, Users, CalendarCheck, HeartHandshake,
  TrendingUp, TrendingDown, Phone, Copy, Check, AlertTriangle
} from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import useApi from '../../hooks/useApi'
import { toCSV, downloadCSV } from '../../utils/csv'

// ─────────────────────────────────────────────────────────────
// Attendance Register — who attended WHICH service, who missed it.
// Rate = present ÷ (present + absent); excused absences are not
// counted against a member. Service dates are calendar dates, so
// they are always shown in UTC (no "one day early" for US users).
// ─────────────────────────────────────────────────────────────

const TYPE_META = {
  sunday:       { label: 'Sunday service',  short: 'S' },
  midweek:      { label: 'Midweek service', short: 'M' },
  special:      { label: 'Special service', short: '★' },
  prayer:       { label: 'Prayer meeting',  short: 'P' },
  youth:        { label: 'Youth service',   short: 'Y' },
  cell_meeting: { label: 'Cell meeting',    short: 'C' },
}

// Shapes differ as well as colours (✓ ✕ E ·) so the grid works for colour-blind readers and in print.
const STATUS = {
  p:   { label: 'Present',      glyph: '✓', cls: 'p' },
  a:   { label: 'Absent',       glyph: '✕', cls: 'a' },
  e:   { label: 'Excused',      glyph: 'E', cls: 'e' },
  '-': { label: 'Not recorded', glyph: '·', cls: 'n' },
}

const BANDS = [
  { key: 'faithful',   label: 'Faithful',   hint: '90%+',      color: '#059669' },
  { key: 'regular',    label: 'Regular',    hint: '60–89%',    color: '#2563EB' },
  { key: 'occasional', label: 'Occasional', hint: '30–59%',    color: '#D97706' },
  { key: 'rare',       label: 'Rare',       hint: 'under 30%', color: '#DC2626' },
]

const fmtDay   = (d, o = { month: 'short', day: 'numeric' }) => new Date(d).toLocaleDateString(undefined, { ...o, timeZone: 'UTC' })
const fmtFull  = (d) => fmtDay(d, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
const isoDay   = (d) => new Date(d).toISOString().slice(0, 10)
const todayISO = () => new Date().toISOString().slice(0, 10)
const telHref  = (p) => `tel:${String(p || '').replace(/[^\d+]/g, '')}`
const rateColor = (r) => (r === null ? '#94A3B8' : r >= 90 ? '#059669' : r >= 60 ? '#2563EB' : r >= 30 ? '#D97706' : '#DC2626')

const CSS = `
.ar-wrap{display:flex;flex-direction:column;gap:var(--space-4,16px)}
.ar-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.ar-head h2{margin:0;font-size:1.15rem;font-weight:800;color:var(--text-primary)}
.ar-head p{margin:2px 0 0;font-size:.8rem;color:var(--text-muted)}
.ar-actions{display:flex;gap:8px;flex-wrap:wrap}
.ar-filters{display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;padding:14px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg,12px)}
.ar-filters label{display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:4px}
.ar-filters select,.ar-filters input{min-width:130px;padding:7px 9px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text-primary);font-size:.85rem}
.ar-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}
.ar-kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg,12px);padding:14px;text-align:left;font:inherit;color:inherit}
.ar-kpi.click{cursor:pointer}.ar-kpi.click:hover{border-color:var(--primary)}
.ar-kpi .top{display:flex;align-items:center;gap:8px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted)}
.ar-kpi .val{font-size:1.9rem;font-weight:800;line-height:1.15;margin-top:6px;color:var(--text-primary)}
.ar-kpi .sub{font-size:.75rem;color:var(--text-muted);margin-top:2px}
.ar-chip{display:inline-flex;align-items:center;gap:3px;font-size:.72rem;font-weight:700;padding:1px 7px;border-radius:999px}
.ar-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg,12px);padding:14px}
.ar-card h3{margin:0 0 10px;font-size:.9rem;font-weight:800;color:var(--text-primary)}
.ar-bandbar{display:flex;height:14px;border-radius:999px;overflow:hidden;background:var(--surface-2,#F1F5F9)}
.ar-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px;font-size:.78rem;color:var(--text-secondary)}
.ar-legend i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
.ar-bars{display:flex;align-items:flex-end;gap:6px;height:140px;overflow-x:auto;padding-bottom:2px}
.ar-bar{flex:1 0 34px;max-width:64px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;background:none;border:0;cursor:pointer;padding:0;font:inherit;color:inherit}
.ar-bar .col{width:100%;border-radius:6px 6px 0 0;min-height:3px;transition:filter .15s}
.ar-bar:hover .col{filter:brightness(1.1)}
.ar-bar .pc{font-size:.68rem;font-weight:700;margin-bottom:2px;color:var(--text-secondary)}
.ar-bar .dt{font-size:.66rem;color:var(--text-muted);margin-top:4px;white-space:nowrap}
.ar-tabs{display:flex;gap:6px;flex-wrap:wrap}
.ar-tab{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--text-secondary);font-size:.83rem;font-weight:600;cursor:pointer}
.ar-tab.on{background:var(--primary);border-color:var(--primary);color:#fff}
.ar-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:10px}
.ar-search{position:relative}.ar-search svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--text-muted)}
.ar-search input{padding:7px 9px 7px 30px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text-primary);font-size:.85rem;min-width:220px}
.ar-toolbar select{padding:7px 9px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text-primary);font-size:.83rem}
.ar-scroll{overflow:auto;max-height:70vh;border:1px solid var(--border);border-radius:var(--radius-lg,12px);background:var(--surface)}
.ar-grid{border-collapse:separate;border-spacing:0;font-size:.82rem;min-width:100%}
.ar-grid th,.ar-grid td{padding:5px 6px;text-align:center;border-bottom:1px solid var(--border);white-space:nowrap}
.ar-grid thead th{position:sticky;top:0;background:var(--surface-2,#F8FAFC);z-index:2;font-weight:700;color:var(--text-secondary);vertical-align:bottom}
.ar-grid .who{position:sticky;left:0;background:var(--surface);text-align:left;min-width:190px;z-index:1;border-right:1px solid var(--border)}
.ar-grid thead .who{z-index:3;background:var(--surface-2,#F8FAFC)}
.ar-who-btn{background:none;border:0;padding:0;font:inherit;color:var(--text-primary);font-weight:600;cursor:pointer;text-align:left}
.ar-who-btn:hover{color:var(--primary);text-decoration:underline}
.ar-id{display:block;font-size:.68rem;color:var(--text-muted);font-weight:500}
.ar-colbtn{background:none;border:0;font:inherit;color:inherit;cursor:pointer;line-height:1.25}
.ar-colbtn:hover{color:var(--primary)}
.ar-colbtn b{display:block;font-size:.8rem}.ar-colbtn span{font-size:.65rem;font-weight:600;color:var(--text-muted)}
.ar-dot{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:7px;font-size:.78rem;font-weight:800}
.ar-dot.p{background:rgba(5,150,105,.16);color:#047857}
.ar-dot.a{background:rgba(220,38,38,.15);color:#B91C1C}
.ar-dot.e{background:rgba(217,119,6,.18);color:#B45309}
.ar-dot.n{background:transparent;color:var(--text-muted);font-weight:500}
.ar-rate{font-weight:800}
.ar-streak{display:inline-block;padding:1px 7px;border-radius:999px;background:rgba(220,38,38,.14);color:#B91C1C;font-size:.72rem;font-weight:800}
.ar-note{font-size:.74rem;color:var(--text-muted);margin-top:8px}
.ar-table{width:100%;border-collapse:collapse;font-size:.85rem}
.ar-table th{text-align:left;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);padding:8px;border-bottom:1px solid var(--border)}
.ar-table td{padding:9px 8px;border-bottom:1px solid var(--border);color:var(--text-primary)}
.ar-table tr.click{cursor:pointer}.ar-table tr.click:hover td{background:var(--surface-2,#F8FAFC)}
.ar-meter{display:inline-block;width:80px;height:7px;border-radius:999px;background:var(--surface-2,#E2E8F0);vertical-align:middle;margin-right:6px;overflow:hidden}
.ar-meter i{display:block;height:100%;border-radius:999px}
.ar-empty{padding:34px;text-align:center;color:var(--text-muted);font-size:.9rem}
.ar-error{padding:14px;border-radius:10px;background:rgba(220,38,38,.1);color:#B91C1C;font-weight:600;font-size:.88rem}
.ar-more{display:block;margin:12px auto 0}
.ar-overlay{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:80;display:flex;justify-content:flex-end}
.ar-drawer{width:min(460px,100%);height:100%;background:var(--surface);box-shadow:-8px 0 30px rgba(0,0,0,.2);display:flex;flex-direction:column}
.ar-drawer header{padding:16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;gap:10px}
.ar-drawer header h3{margin:0;font-size:1.02rem;font-weight:800;color:var(--text-primary)}
.ar-drawer header p{margin:2px 0 0;font-size:.78rem;color:var(--text-muted)}
.ar-drawer .body{padding:16px;overflow:auto;flex:1}
.ar-x{background:none;border:0;cursor:pointer;color:var(--text-muted);padding:4px;border-radius:6px;height:fit-content}
.ar-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(90px,1fr));gap:8px;margin-bottom:14px}
.ar-stat{background:var(--surface-2,#F8FAFC);border:1px solid var(--border);border-radius:10px;padding:8px 10px}
.ar-stat b{display:block;font-size:1.15rem;color:var(--text-primary)}.ar-stat span{font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
.ar-list{list-style:none;margin:10px 0 0;padding:0}
.ar-list li{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--border);font-size:.86rem}
.ar-list a{color:var(--primary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;font-size:.8rem}
.ar-timeline{display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 14px}
.ar-pill{display:inline-block;padding:1px 8px;border-radius:999px;font-size:.72rem;font-weight:700}
@media print{.ar-actions,.ar-filters,.ar-tabs,.ar-toolbar,.ar-overlay{display:none!important}.ar-scroll{max-height:none;overflow:visible}}
`

// ── small pieces ──────────────────────────────────────────────
function Dot({ c, title }) {
  const s = STATUS[c] || STATUS['-']
  return <span className={`ar-dot ${s.cls}`} title={title || s.label} aria-label={title || s.label}>{s.glyph}</span>
}

function Drawer({ title, subtitle, onClose, children }) {
  return (
    <div className="ar-overlay" onClick={onClose}>
      <aside className="ar-drawer" role="dialog" aria-label={title} onClick={e => e.stopPropagation()}>
        <header>
          <div><h3>{title}</h3>{subtitle && <p>{subtitle}</p>}</div>
          <button className="ar-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="body">{children}</div>
      </aside>
    </div>
  )
}

function ServiceDrawer({ service, idx, members, onClose, onMember }) {
  const counts = { a: 0, p: 0, e: 0, '-': 0 }
  members.forEach(m => { counts[m.cells[idx]]++ })
  const [tab, setTab] = useState(counts.a > 0 ? 'a' : 'p')
  const [q, setQ] = useState('')
  const list = members.filter(m => m.cells[idx] === tab &&
    (!q || `${m.name} ${m.memberId} ${m.phone}`.toLowerCase().includes(q.toLowerCase())))

  const exportList = () => {
    const rows = members.map(m => [m.memberId, m.name, m.phone, m.department?.name || '', STATUS[m.cells[idx]].label])
    downloadCSV(`ministryos-${isoDay(service.date)}-${service.type}-attendance.csv`,
      toCSV(['Member ID', 'Name', 'Phone', 'Department', 'Attendance'], rows))
  }

  return (
    <Drawer title={service.name} subtitle={`${fmtFull(service.date)}${service.time ? ` · ${service.time}` : ''} · ${TYPE_META[service.type]?.label || service.type}`} onClose={onClose}>
      <div className="ar-stats">
        <div className="ar-stat"><b style={{ color: rateColor(service.rate) }}>{service.rate === null ? '—' : `${service.rate}%`}</b><span>Rate</span></div>
        <div className="ar-stat"><b>{counts.p}</b><span>Present</span></div>
        <div className="ar-stat"><b>{counts.a}</b><span>Absent</span></div>
        <div className="ar-stat"><b>{counts.e}</b><span>Excused</span></div>
      </div>
      <div className="ar-tabs" role="tablist">
        {[['a', 'Absent'], ['p', 'Present'], ['e', 'Excused'], ['-', 'Not recorded']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`ar-tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {label} ({counts[k]})
          </button>
        ))}
      </div>
      <div className="ar-toolbar" style={{ marginTop: 12 }}>
        <div className="ar-search"><Search size={14} /><input placeholder="Search this list…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <button className="btn-ghost" onClick={exportList}><Download size={14} /> CSV</button>
      </div>
      {list.length === 0 ? <p className="ar-empty">Nobody in this list.</p> : (
        <ul className="ar-list">
          {list.map(m => (
            <li key={m.id}>
              <div>
                <button className="ar-who-btn" onClick={() => onMember(m.id)}>{m.name}</button>
                <span className="ar-id">{m.memberId}{m.department ? ` · ${m.department.name}` : ''}</span>
              </div>
              {m.phone && <a href={telHref(m.phone)}><Phone size={13} /> {m.phone}</a>}
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}

function MemberDrawer({ member, services, onClose }) {
  return (
    <Drawer title={member.name} subtitle={`${member.memberId}${member.department ? ` · ${member.department.name}` : ''} · ${member.status.replace('_', ' ')}`} onClose={onClose}>
      <div className="ar-stats">
        <div className="ar-stat"><b style={{ color: rateColor(member.rate) }}>{member.rate === null ? '—' : `${member.rate}%`}</b><span>Rate</span></div>
        <div className="ar-stat"><b>{member.present}</b><span>Attended</span></div>
        <div className="ar-stat"><b>{member.absent}</b><span>Missed</span></div>
        <div className="ar-stat"><b>{member.absenceStreak}</b><span>Missed in a row</span></div>
      </div>
      <p className="ar-note" style={{ marginTop: 0 }}>
        Last attended: <b>{member.lastAttended ? fmtFull(member.lastAttended) : 'not in this period'}</b>
        {member.phone && <> · <a href={telHref(member.phone)} style={{ color: 'var(--primary)' }}>{member.phone}</a></>}
      </p>
      <div className="ar-timeline" aria-label="Attendance timeline, oldest to newest">
        {[...services].reverse().map((s) => <Dot key={s.id} c={member.cells[services.indexOf(s)]} title={`${STATUS[member.cells[services.indexOf(s)]].label} — ${s.name}, ${fmtDay(s.date)}`} />)}
      </div>
      <ul className="ar-list">
        {services.map((s, i) => {
          const st = STATUS[member.cells[i]]
          const colors = { p: ['rgba(5,150,105,.16)', '#047857'], a: ['rgba(220,38,38,.15)', '#B91C1C'], e: ['rgba(217,119,6,.18)', '#B45309'], '-': ['transparent', 'var(--text-muted)'] }[st.cls === 'n' ? '-' : st.cls]
          return (
            <li key={s.id}>
              <span>{s.name}<span className="ar-id">{fmtFull(s.date)}</span></span>
              <span className="ar-pill" style={{ background: colors[0], color: colors[1] }}>{st.glyph} {st.label}</span>
            </li>
          )
        })}
      </ul>
    </Drawer>
  )
}

// ── the view (pure: everything arrives as props) ──────────────
export function RegisterView({ data, loading, error, filters, setFilter, resetFilters }) {
  const [view, setView]         = useState('register')
  const [q, setQ]               = useState('')
  const [sort, setSort]         = useState('name')
  const [newestFirst, setNewest] = useState(true)
  const [svcOpen, setSvcOpen]   = useState(null)    // service index
  const [memOpen, setMemOpen]   = useState(null)    // member id
  const [careMin, setCareMin]   = useState(3)
  const [shown, setShown]       = useState(100)
  const [copied, setCopied]     = useState(false)

  const services = useMemo(() => data?.services || [], [data])
  const members  = useMemo(() => data?.members  || [], [data])

  const cols = useMemo(() => {
    const c = services.map((s, i) => ({ s, i }))
    return newestFirst ? c : c.reverse()
  }, [services, newestFirst])

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase()
    let list = needle ? members.filter(m => `${m.name} ${m.memberId} ${m.phone}`.toLowerCase().includes(needle)) : [...members]
    const byName = (a, b) => a.name.localeCompare(b.name)
    if (sort === 'rate')        list.sort((a, b) => (a.rate ?? 101) - (b.rate ?? 101) || byName(a, b))
    else if (sort === 'rate_hi') list.sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1) || byName(a, b))
    else if (sort === 'streak') list.sort((a, b) => b.absenceStreak - a.absenceStreak || byName(a, b))
    else list.sort(byName)
    return list
  }, [members, q, sort])

  const care = useMemo(() => members
    .filter(m => m.absenceStreak >= careMin)
    .sort((a, b) => b.absenceStreak - a.absenceStreak || (a.rate ?? 0) - (b.rate ?? 0)), [members, careMin])

  const summary = data?.summary
  const openService = svcOpen !== null ? services[svcOpen] : null
  const openMember  = memOpen ? members.find(m => m.id === memOpen) : null

  // ── exports ──
  const registerRows = () => {
    const chrono = services.map((s, i) => ({ s, i })).reverse()
    const headers = ['Member ID', 'Name', 'Phone', 'Department', 'Cell group', 'Status',
      ...chrono.map(({ s }) => `${isoDay(s.date)} ${s.name}`),
      'Attended', 'Missed', 'Excused', 'Rate %', 'Missed in a row', 'Last attended']
    const rows = visible.map(m => [m.memberId, m.name, m.phone, m.department?.name || '', m.cellGroup?.name || '', m.status,
      ...chrono.map(({ i }) => STATUS[m.cells[i]].label),
      m.present, m.absent, m.excused, m.rate ?? '', m.absenceStreak, m.lastAttended ? isoDay(m.lastAttended) : ''])
    return { headers, rows }
  }
  const exportCSV = () => {
    const { headers, rows } = registerRows()
    downloadCSV(`ministryos-attendance-register-${todayISO()}.csv`, toCSV(headers, rows))
  }
  const exportCare = () => {
    downloadCSV(`ministryos-attendance-follow-up-${todayISO()}.csv`, toCSV(
      ['Member ID', 'Name', 'Phone', 'Department', 'Missed in a row', 'Rate %', 'Last attended'],
      care.map(m => [m.memberId, m.name, m.phone, m.department?.name || '', m.absenceStreak, m.rate ?? '', m.lastAttended ? isoDay(m.lastAttended) : ''])))
  }
  const exportPDF = () => {
    const MAXC = 18
    const chrono = services.map((s, i) => ({ s, i })).reverse().slice(-MAXC)   // oldest → newest, newest 18
    const doc = new jsPDF('l', 'mm', 'a4')
    doc.setFillColor(79, 70, 229); doc.rect(0, 0, 297, 22, 'F')
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15); doc.text('Attendance Register', 10, 10)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5)
    const span = services.length ? `${fmtDay(services[services.length - 1].date, { year: 'numeric', month: 'short', day: 'numeric' })} – ${fmtDay(services[0].date, { year: 'numeric', month: 'short', day: 'numeric' })}` : ''
    doc.text(`${span}  ·  ${visible.length} members  ·  generated ${todayISO()}`, 10, 16.5)
    doc.setTextColor(0)
    autoTable(doc, {
      startY: 27,
      head: [['Member', 'Dept', ...chrono.map(({ s }) => fmtDay(s.date)), 'Rate']],
      body: visible.map(m => [m.name, m.department?.name || '', ...chrono.map(({ i }) => ({ p: 'P', a: 'A', e: 'E', '-': '-' }[m.cells[i]])), m.rate === null ? '-' : `${m.rate}%`]),
      styles: { fontSize: 7, cellPadding: 1.2, halign: 'center' },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontSize: 6.5 },
      columnStyles: { 0: { halign: 'left', cellWidth: 40 }, 1: { halign: 'left', cellWidth: 22 } },
      didParseCell: (h) => {
        if (h.section !== 'body' || h.column.index < 2 || h.column.index >= 2 + chrono.length) return
        const v = h.cell.raw
        if (v === 'P') { h.cell.styles.fillColor = [209, 250, 229]; h.cell.styles.textColor = [4, 120, 87] }
        else if (v === 'A') { h.cell.styles.fillColor = [254, 226, 226]; h.cell.styles.textColor = [185, 28, 28] }
        else if (v === 'E') { h.cell.styles.fillColor = [254, 243, 199]; h.cell.styles.textColor = [180, 83, 9] }
      },
      margin: { left: 10, right: 10 },
    })
    const pages = doc.internal.getNumberOfPages()
    for (let p = 1; p <= pages; p++) {
      doc.setPage(p); doc.setFontSize(7); doc.setTextColor(120)
      doc.text('P = present · A = absent · E = excused · - = not recorded.  Rate = present ÷ (present + absent); excused absences are not counted against a member.' +
        (services.length > MAXC ? `  Showing the latest ${MAXC} of ${services.length} services.` : ''), 10, 203)
      doc.text(`MinistryOS — page ${p} of ${pages}`, 287, 203, { align: 'right' })
    }
    doc.save(`MinistryOS-Attendance-Register-${todayISO()}.pdf`)
  }
  const copyPhones = async () => {
    try { await navigator.clipboard.writeText(care.map(m => m.phone).filter(Boolean).join(', ')); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard unavailable */ }
  }

  const deptOptions = data?.filters?.departments || []
  const cellOptions = data?.filters?.cellGroups || []

  return (
    <div className="ar-wrap">
      <style>{CSS}</style>

      <div className="ar-head">
        <div>
          <h2>Attendance Register</h2>
          <p>Who attended which service — and who missed it.</p>
        </div>
        <div className="ar-actions">
          <button className="btn-ghost" onClick={exportCSV} disabled={!members.length}><Download size={15} /> Export CSV</button>
          <button className="btn-ghost" onClick={exportPDF} disabled={!members.length}><FileDown size={15} /> Export PDF</button>
        </div>
      </div>

      <div className="ar-filters">
        <div><label htmlFor="ar-from">From</label><input id="ar-from" type="date" value={filters.from} max={filters.to || undefined} onChange={e => setFilter('from', e.target.value)} /></div>
        <div><label htmlFor="ar-to">To</label><input id="ar-to" type="date" value={filters.to} min={filters.from || undefined} onChange={e => setFilter('to', e.target.value)} /></div>
        <div><label htmlFor="ar-type">Service type</label>
          <select id="ar-type" value={filters.type} onChange={e => setFilter('type', e.target.value)}>
            <option value="">All services</option>
            {Object.entries(TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select></div>
        <div><label htmlFor="ar-dept">Department</label>
          <select id="ar-dept" value={filters.departmentId} onChange={e => setFilter('departmentId', e.target.value)}>
            <option value="">All departments</option>
            {deptOptions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select></div>
        {cellOptions.length > 0 && (
          <div><label htmlFor="ar-cell">Cell group</label>
            <select id="ar-cell" value={filters.cellGroupId} onChange={e => setFilter('cellGroupId', e.target.value)}>
              <option value="">{cellOptions.length > 1 ? 'All cell groups' : cellOptions[0].name}</option>
              {cellOptions.length > 1 && cellOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
        )}
        <div><label htmlFor="ar-status">Members</label>
          <select id="ar-status" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
            <option value="">All (except transferred)</option>
            <option value="active">Active</option><option value="inactive">Inactive</option>
            <option value="new_convert">New converts</option><option value="visitor">Visitors</option>
          </select></div>
        <div><label htmlFor="ar-count">Services shown</label>
          <select id="ar-count" value={filters.services} onChange={e => setFilter('services', e.target.value)}>
            {['8', '12', '24', '52'].map(n => <option key={n} value={n}>Latest {n}</option>)}
          </select></div>
        <button className="btn-ghost" onClick={resetFilters}>Reset</button>
      </div>

      {error ? <div className="ar-error">{error}</div> : loading && !data ? <p className="ar-empty">Loading attendance…</p> : !data ? null : services.length === 0 ? (
        <div className="ar-card ar-empty">
          No services with recorded attendance match these filters.<br />
          Mark attendance for a service first, or widen the dates.
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="ar-kpis">
            <div className="ar-kpi">
              <div className="top"><CalendarCheck size={14} /> Average attendance</div>
              <div className="val" style={{ color: rateColor(summary.avgRate) }}>{summary.avgRate === null ? '—' : `${summary.avgRate}%`}</div>
              <div className="sub">
                {summary.trend !== null && summary.trend !== 0 ? (
                  <span className="ar-chip" style={{ background: summary.trend > 0 ? 'rgba(5,150,105,.14)' : 'rgba(220,38,38,.12)', color: summary.trend > 0 ? '#047857' : '#B91C1C' }}>
                    {summary.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {summary.trend > 0 ? '+' : ''}{summary.trend} pts
                  </span>
                ) : null}{' '}across {summary.services} service{summary.services === 1 ? '' : 's'}
              </div>
            </div>
            <div className="ar-kpi">
              <div className="top"><Users size={14} /> Members tracked</div>
              <div className="val">{summary.members}</div>
              <div className="sub">{summary.bands.faithful} faithful (90%+)</div>
            </div>
            <div className="ar-kpi">
              <div className="top"><TrendingUp size={14} /> Best / lowest</div>
              <div className="val" style={{ fontSize: '1.15rem' }}>{summary.best ? `${summary.best.rate}%` : '—'} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/</span> {summary.worst ? `${summary.worst.rate}%` : '—'}</div>
              <div className="sub">{summary.best ? `${summary.best.name}, ${fmtDay(summary.best.date)}` : ''}</div>
            </div>
            <button className="ar-kpi click" onClick={() => setView('care')}>
              <div className="top"><HeartHandshake size={14} /> Need a follow-up</div>
              <div className="val" style={{ color: summary.needsFollowUp ? '#B91C1C' : undefined }}>{summary.needsFollowUp}</div>
              <div className="sub">missed 2+ services in a row →</div>
            </button>
          </div>

          {/* Consistency bands + service bars */}
          <div className="ar-card">
            <h3>Member consistency</h3>
            <div className="ar-bandbar" role="img" aria-label="Distribution of members by attendance consistency">
              {BANDS.map(b => summary.bands[b.key] > 0 && (
                <div key={b.key} title={`${b.label}: ${summary.bands[b.key]}`} style={{ width: `${(summary.bands[b.key] / Math.max(1, summary.members)) * 100}%`, background: b.color }} />
              ))}
            </div>
            <div className="ar-legend">
              {BANDS.map(b => <span key={b.key}><i style={{ background: b.color }} />{b.label} {b.hint} — <b>{summary.bands[b.key]}</b></span>)}
              {summary.bands.no_data > 0 && <span><i style={{ background: '#94A3B8' }} />No data — <b>{summary.bands.no_data}</b></span>}
            </div>
          </div>

          <div className="ar-card">
            <h3>Attendance by service <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: '.75rem' }}>— click a bar to see who came and who didn’t</span></h3>
            <div className="ar-bars">
              {[...services].map((s, i) => ({ s, i })).reverse().map(({ s, i }) => (
                <button key={s.id} className="ar-bar" onClick={() => setSvcOpen(i)} title={`${s.name} · ${fmtDay(s.date)} · ${s.present} present, ${s.absent} absent`}>
                  <span className="pc">{s.rate === null ? '—' : `${s.rate}%`}</span>
                  <span className="col" style={{ height: `${Math.max(3, s.rate || 0) * 0.8}px`, background: rateColor(s.rate) }} />
                  <span className="dt">{fmtDay(s.date)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Views */}
          <div className="ar-tabs" role="tablist">
            {[['register', 'Register (members × services)'], ['services', 'By service'], ['care', `Follow-up list (${care.length})`]].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={view === k} className={`ar-tab ${view === k ? 'on' : ''}`} onClick={() => setView(k)}>{label}</button>
            ))}
          </div>

          {view === 'register' && (
            <div>
              <div className="ar-toolbar">
                <div className="ar-search"><Search size={14} /><input placeholder="Find a member…" aria-label="Find a member" value={q} onChange={e => { setQ(e.target.value); setShown(100) }} /></div>
                <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Sort members">
                  <option value="name">Sort: name A–Z</option>
                  <option value="rate">Sort: lowest attendance first</option>
                  <option value="rate_hi">Sort: highest attendance first</option>
                  <option value="streak">Sort: most missed in a row</option>
                </select>
                <button className="btn-ghost" onClick={() => setNewest(v => !v)}>{newestFirst ? 'Newest first' : 'Oldest first'}</button>
              </div>
              <div className="ar-scroll">
                <table className="ar-grid">
                  <thead>
                    <tr>
                      <th className="who">Member ({visible.length})</th>
                      <th>Rate</th>
                      {cols.map(({ s, i }) => (
                        <th key={s.id}>
                          <button className="ar-colbtn" onClick={() => setSvcOpen(i)} title={`${s.name} — ${fmtFull(s.date)}`}>
                            <b>{fmtDay(s.date)}</b><span>{TYPE_META[s.type]?.short || '•'} {s.rate === null ? '' : `${s.rate}%`}</span>
                          </button>
                        </th>
                      ))}
                      <th>Missed in a row</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.slice(0, shown).map(m => (
                      <tr key={m.id}>
                        <td className="who">
                          <button className="ar-who-btn" onClick={() => setMemOpen(m.id)}>{m.name}</button>
                          <span className="ar-id">{m.memberId}{m.department ? ` · ${m.department.name}` : ''}</span>
                        </td>
                        <td className="ar-rate" style={{ color: rateColor(m.rate) }}>{m.rate === null ? '—' : `${m.rate}%`}</td>
                        {cols.map(({ s, i }) => (
                          <td key={s.id}><Dot c={m.cells[i]} title={`${STATUS[m.cells[i]].label} — ${s.name}, ${fmtDay(s.date)}`} /></td>
                        ))}
                        <td>{m.absenceStreak > 0 ? <span className="ar-streak">{m.absenceStreak}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                      </tr>
                    ))}
                    {visible.length === 0 && <tr><td className="who" colSpan={3 + cols.length}>No members match.</td></tr>}
                  </tbody>
                </table>
              </div>
              {visible.length > shown && (
                <button className="btn-ghost ar-more" onClick={() => setShown(n => n + 200)}>Show more ({visible.length - shown} remaining)</button>
              )}
              <p className="ar-note">
                <Dot c="p" /> present &nbsp; <Dot c="a" /> absent &nbsp; <Dot c="e" /> excused &nbsp; <Dot c="-" /> not recorded (e.g. joined later).
                &nbsp;Rate = present ÷ (present + absent); excused absences are not counted against a member.
                {data.truncated && <> &nbsp;<AlertTriangle size={12} style={{ verticalAlign: -2 }} /> Showing the first 2,000 members — filter by department to narrow down.</>}
              </p>
            </div>
          )}

          {view === 'services' && (
            <div className="ar-scroll">
              <table className="ar-table">
                <thead><tr><th>Date</th><th>Service</th><th>Type</th><th>Present</th><th>Absent</th><th>Excused</th><th>Not recorded</th><th>Rate</th></tr></thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.id} className="click" onClick={() => setSvcOpen(i)}>
                      <td>{fmtFull(s.date)}</td><td><b>{s.name}</b></td><td>{TYPE_META[s.type]?.label || s.type}</td>
                      <td>{s.present}</td><td>{s.absent}</td><td>{s.excused}</td><td>{s.notRecorded}</td>
                      <td><span className="ar-meter"><i style={{ width: `${s.rate || 0}%`, background: rateColor(s.rate) }} /></span><b>{s.rate === null ? '—' : `${s.rate}%`}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'care' && (
            <div className="ar-card">
              <div className="ar-toolbar">
                <h3 style={{ margin: 0 }}>Members to follow up with</h3>
                <select value={careMin} onChange={e => setCareMin(Number(e.target.value))} aria-label="Minimum services missed in a row">
                  {[2, 3, 4, 6].map(n => <option key={n} value={n}>Missed {n}+ in a row</option>)}
                </select>
                <button className="btn-ghost" onClick={copyPhones} disabled={!care.length}>{copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy phone numbers</>}</button>
                <button className="btn-ghost" onClick={exportCare} disabled={!care.length}><Download size={14} /> CSV</button>
              </div>
              {care.length === 0 ? <p className="ar-empty">🎉 Nobody has missed {careMin} or more services in a row.</p> : (
                <table className="ar-table">
                  <thead><tr><th>Member</th><th>Department</th><th>Missed in a row</th><th>Last attended</th><th>Rate</th><th>Phone</th></tr></thead>
                  <tbody>
                    {care.map(m => (
                      <tr key={m.id}>
                        <td><button className="ar-who-btn" onClick={() => setMemOpen(m.id)}>{m.name}</button><span className="ar-id">{m.memberId}</span></td>
                        <td>{m.department?.name || '—'}</td>
                        <td><span className="ar-streak">{m.absenceStreak}</span></td>
                        <td>{m.lastAttended ? fmtDay(m.lastAttended, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not in this period'}</td>
                        <td style={{ color: rateColor(m.rate), fontWeight: 700 }}>{m.rate === null ? '—' : `${m.rate}%`}</td>
                        <td>{m.phone ? <a href={telHref(m.phone)} style={{ color: 'var(--primary)' }}>{m.phone}</a> : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {openService && <ServiceDrawer key={openService.id} service={openService} idx={svcOpen} members={members} onClose={() => setSvcOpen(null)} onMember={(id) => { setSvcOpen(null); setMemOpen(id) }} />}
      {openMember && <MemberDrawer member={openMember} services={services} onClose={() => setMemOpen(null)} />}
    </div>
  )
}

// ── the connected component ───────────────────────────────────
const DEFAULT_FILTERS = { from: '', to: '', type: '', status: '', departmentId: '', cellGroupId: '', services: '12' }

export default function AttendanceRegister() {
  const { api, branchReady } = useApi()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const setFilter = (k, v) => setFilters(prev => ({ ...prev, [k]: v }))
  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  const query = useMemo(() => {
    const p = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v) })
    return p.toString()
  }, [filters])

  const load = useCallback(async () => {
    if (!branchReady) return
    setLoading(true); setError('')
    try {
      const res = await api(`/reports/attendance/register${query ? `?${query}` : ''}`)
      if (res.success) setData(res)
      else { setData(null); setError(res.message || "You don't have permission to view member-level attendance.") }
    } catch {
      setData(null); setError('Unable to load the attendance register.')
    } finally { setLoading(false) }
  }, [api, branchReady, query])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load() }, [load])

  return <RegisterView data={data} loading={loading} error={error} filters={filters} setFilter={setFilter} resetFilters={resetFilters} />
}
