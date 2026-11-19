// AttendanceSummary.jsx — MinistryOS
// Located at: client/src/pages/attendance/AttendanceSummary.jsx
// ───────────────────────────────────────────────────────────
// The "who came, and exactly when" report for one service.
//
//  • PRESENT tab : everyone checked in, in the order they arrived, with the
//                  exact time (to the second) they were marked present.
//  • ABSENT tab  : the follow-up list, with one-tap WhatsApp and call buttons.
//                  While the service is still running this tab is called
//                  "Not yet in", because those people may still arrive.
//
// Props
//   service   – the service object
//   members   – all active members
//   attendance– { [memberId]: 'present' | 'absent' }
//   times     – { [memberId]: ISO date string }  exact check-in moments
//   finished  – true once the usher pressed Finish
//   initialTab– 'present' | 'absent'

import { useMemo, useState } from 'react'
import { CheckCircle, XCircle, Phone, MessageCircle, Search, Clock, ArrowLeft, Sunrise, Hourglass } from 'lucide-react'
import { fmtDate } from '../../utils/dates'
import { fmtClock } from '../../utils/clock'

export default function AttendanceSummary({
  service, members, attendance, times = {}, finished = false,
  initialTab = 'present', onClose, onDone
}) {
  const [tab, setTab]     = useState(initialTab)
  const [filter, setFilter] = useState('')

  const { present, absent } = useMemo(() => {
    const p = members.filter(m => attendance[String(m._id)] === 'present')
    // Arrival order: earliest first. People with no recorded time go last.
    p.sort((a, b) => {
      const ta = times[String(a._id)] ? new Date(times[String(a._id)]).getTime() : Infinity
      const tb = times[String(b._id)] ? new Date(times[String(b._id)]).getTime() : Infinity
      return ta - tb
    })
    const a = members.filter(m => attendance[String(m._id)] !== 'present')
    return { present: p, absent: a }
  }, [members, attendance, times])

  const timed = present.filter(m => times[String(m._id)])
  const first = timed[0]
  const last  = timed[timed.length - 1]
  const rate  = members.length ? Math.round((present.length / members.length) * 100) : 0

  const absentLabel = finished ? 'Absent' : 'Not yet in'

  const q = filter.trim().toLowerCase()
  const list = (tab === 'present' ? present : absent).filter(m =>
    !q || `${m.firstName} ${m.lastName} ${m.memberId || ''} ${m.phone || ''}`.toLowerCase().includes(q)
  )

  const subtitle = (m) => {
    const parts = []
    if (m.departmentId?.name) parts.push(m.departmentId.name)
    if (m.cellGroupId?.name)  parts.push(m.cellGroupId.name)
    return parts.join(' · ') || m.memberId || ''
  }

  const waLink = (m) => {
    // Ghana: 0244… → 233244…  (wa.me needs the country code, no +)
    let d = String(m.phone || '').replace(/\D/g, '')
    if (d.startsWith('0')) d = '233' + d.slice(1)
    const text = encodeURIComponent(
      `Hello ${m.firstName}, we missed you at ${service.name}. We hope you are well. God bless you!`
    )
    return `https://wa.me/${d}?text=${text}`
  }

  return (
    <div className="sm-sum">
      {/* ── header ── */}
      <div className="sm-sum-head">
        <button className="sm-icon-btn light" onClick={onClose} aria-label="Back to attendance">
          <ArrowLeft size={20} />
        </button>
        <div className="sm-sum-title">
          <h2>{service.name}</h2>
          <p>
            {fmtDate(service.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {service.time ? ` · ${service.time}` : ''}
          </p>
        </div>
      </div>

      {/* ── stat tiles ── */}
      <div className="sm-sum-tiles">
        <div className="sm-tile good">
          <CheckCircle size={18} />
          <strong>{present.length}</strong><span>Present</span>
        </div>
        <div className="sm-tile bad">
          <XCircle size={18} />
          <strong>{absent.length}</strong><span>{absentLabel}</span>
        </div>
        <div className="sm-tile">
          <Hourglass size={18} />
          <strong>{rate}%</strong><span>Attendance</span>
        </div>
      </div>

      {(first || last) && (
        <div className="sm-sum-range">
          {first && (
            <div>
              <Sunrise size={16} />
              <span>First in</span>
              <strong>{first.firstName} {first.lastName}</strong>
              <em>{fmtClock(times[String(first._id)], true)}</em>
            </div>
          )}
          {last && last !== first && (
            <div>
              <Clock size={16} />
              <span>Latest</span>
              <strong>{last.firstName} {last.lastName}</strong>
              <em>{fmtClock(times[String(last._id)], true)}</em>
            </div>
          )}
        </div>
      )}

      {/* ── tabs + search ── */}
      <div className="sm-sum-controls">
        <div className="sm-seg" role="tablist">
          <button role="tab" aria-selected={tab === 'present'} className={tab === 'present' ? 'on' : ''}
            onClick={() => setTab('present')}>Present <em>{present.length}</em></button>
          <button role="tab" aria-selected={tab === 'absent'} className={tab === 'absent' ? 'on' : ''}
            onClick={() => setTab('absent')}>{absentLabel} <em>{absent.length}</em></button>
        </div>
        <label className="sm-sum-search">
          <Search size={16} />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search this list" />
        </label>
      </div>

      {/* ── list ── */}
      <div className="sm-sum-list">
        {list.length === 0 ? (
          <p className="sm-sum-empty">
            {q ? 'No one matches that search.'
              : tab === 'present' ? 'No one has been marked present yet.'
              : finished ? 'Everyone was present. 🎉' : 'Everyone has checked in. 🎉'}
          </p>
        ) : list.map((m, i) => {
          const id = String(m._id)
          const isPresent = tab === 'present'
          return (
            <div key={id} className={`sm-sum-row ${isPresent ? 'present' : 'absent'}`}>
              {isPresent && <span className="sm-rank">{i + 1}</span>}
              <span className="sm-avatar">{`${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase()}</span>
              <span className="sm-card-text">
                <span className="sm-card-name">{m.firstName} {m.lastName}</span>
                <span className="sm-card-sub">{subtitle(m)}</span>
              </span>

              {isPresent ? (
                <span className="sm-time-chip" title="Exact check-in time">
                  <Clock size={13} />
                  {times[id] ? fmtClock(times[id], true) : 'Time not recorded'}
                </span>
              ) : (
                m.phone && (
                  <span className="sm-row-actions">
                    <a href={waLink(m)} target="_blank" rel="noopener noreferrer"
                       className="sm-round wa" title="Message on WhatsApp" aria-label={`WhatsApp ${m.firstName}`}>
                      <MessageCircle size={16} />
                    </a>
                    <a href={`tel:${m.phone}`} className="sm-round" title="Call" aria-label={`Call ${m.firstName}`}>
                      <Phone size={16} />
                    </a>
                  </span>
                )
              )}
            </div>
          )
        })}
      </div>

      {/* ── actions ── */}
      <div className="sm-sum-actions">
        <button className="sm-btn-ghost" onClick={onClose}>Back to attendance</button>
        {onDone && <button className="sm-btn-primary" onClick={onDone}>Done</button>}
      </div>
    </div>
  )
}
