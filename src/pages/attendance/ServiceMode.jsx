// ServiceMode.jsx — MinistryOS
// Located at: client/src/pages/attendance/ServiceMode.jsx
// ───────────────────────────────────────────────────────────
// Full-screen attendance for the church door. Replaces the old modal.
//
// DESIGN RULES (why it works the way it does)
//  1. THREE states per member: unmarked → present → (absent).
//     "Unmarked" means nobody has touched this person yet. They only become
//     "absent" when the usher taps Finish. This keeps the data honest.
//  2. The search box is ALWAYS focused. Type → Enter → checked in → box clears.
//  3. AUTOSAVE. Every tap is sent to the server (debounced). No Save button
//     to forget, and two ushers at two doors see each other's check-ins
//     (we poll the server every 10s).
//  4. Every check-in can be UNDONE from the toast.
//  5. A person not on the list becomes a VISITOR in two fields, not a full
//     member form.
//
// STATE MODEL
//   marks : { [memberId]: 'present' | 'absent' }   (missing key = unmarked)
//   savedRef : { [memberId]: 'present' | 'absent' }   (what the server has)
//   dirty = every id where marks[id] exists and marks[id] !== saved[id]
//
// We mirror marks/saved in refs so timers (autosave, polling) never read
// stale values from an old render.

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  X, Search, Check, UserPlus, MoreHorizontal, Volume2, VolumeX,
  Undo2, ClipboardList, WifiOff, CheckCircle, Loader2, AlertTriangle,
  Sparkles, Clock, Users, ChevronDown
} from 'lucide-react'
import AttendanceSummary from './AttendanceSummary'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { buildIndex, searchIndex, normalizePhone } from '../../utils/memberSearch'
import { fmtDate } from '../../utils/dates'
import { fmtClock } from '../../utils/clock'
import '../../styles/service-mode.css'

const AUTOSAVE_DELAY = 1200   // ms after the last tap before we save
const POLL_EVERY     = 10000  // ms — pick up check-ins from other devices
const RETRY_EVERY    = 5000   // ms — after a failed save

// Service type → Visitor.serviceType enum on the server
const VISITOR_SERVICE_TYPE = {
  sunday: 'sunday_service', midweek: 'midweek_service', special: 'special_service',
  prayer: 'prayer_meeting', youth: 'other', cell_meeting: 'other'
}

// ─── tiny feedback helpers ───────────────────
let audioCtx = null
function beep(kind) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    audioCtx = audioCtx || new Ctx()
    // 'ok' = a happy two-note chime. 'dup' = a low single tone.
    const notes = kind === 'ok' ? [[784, 0, 0.11], [1175, 0.1, 0.2]] : [[kind === 'dup' ? 330 : 220, 0, 0.18]]
    notes.forEach(([freq, delay, len]) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.value = 0.08
      osc.connect(gain); gain.connect(audioCtx.destination)
      osc.start(audioCtx.currentTime + delay)
      osc.stop(audioCtx.currentTime + delay + len)
    })
  } catch { /* sound is a bonus, never an error */ }
}
const buzz = () => { try { navigator.vibrate?.(25) } catch { /* ignore */ } }

const initialsOf = (m) => `${m.firstName?.[0] || ''}${m.lastName?.[0] || ''}`.toUpperCase()

// Confetti for the "you've been marked present" celebration.
// x = sideways drift (px), r = spin (deg), d = delay (s), c = colour
const CONFETTI = [
  { x: -150, r: 220, d: 0.00, c: '#F59E0B' }, { x: -110, r: -180, d: 0.04, c: '#10B981' },
  { x:  -80, r: 300, d: 0.02, c: '#8B5CF6' }, { x:  -50, r: -240, d: 0.06, c: '#EF4444' },
  { x:  -20, r: 160, d: 0.01, c: '#3B82F6' }, { x:   15, r: -300, d: 0.05, c: '#F59E0B' },
  { x:   45, r: 260, d: 0.03, c: '#10B981' }, { x:   80, r: -200, d: 0.07, c: '#EC4899' },
  { x:  110, r: 340, d: 0.02, c: '#8B5CF6' }, { x:  150, r: -260, d: 0.05, c: '#3B82F6' },
  { x: -130, r: -120, d: 0.09, c: '#EC4899' }, { x:  -65, r: 200, d: 0.10, c: '#F59E0B' },
  { x:   30, r: -140, d: 0.08, c: '#EF4444' }, { x:  100, r: 180, d: 0.11, c: '#10B981' },
  { x:  135, r: -320, d: 0.09, c: '#F59E0B' }, { x:  -95, r: 280, d: 0.12, c: '#3B82F6' }
]

// ─── LIST ROWS ───────────────────────────────
// Two rows, one rule: TAPPING CAN ONLY CHECK SOMEONE IN. Taking a check-in
// back is a separate, small button that always asks "Are you sure?".
const deptName = (m) => m.departmentId?.name || ''

// A person who has arrived (Live arrivals feed)
function ArrivalRow({ member, time, flash, onAskRemove }) {
  return (
    <li className={`sm-row present ${flash ? 'flash' : ''}`}>
      <span className="sm-avatar">{initialsOf(member)}</span>
      <span className="sm-card-text">
        <span className="sm-card-name">{member.firstName} {member.lastName}</span>
        <span className="sm-card-sub">{member.memberId}{deptName(member) ? ` · ${deptName(member)}` : ''}</span>
      </span>
      <span className="sm-time-chip" title="Check-in time">
        <Clock size={13} /> {time ? fmtClock(time) : '—'}
      </span>
      <button className="sm-row-remove" onClick={() => onAskRemove(String(member._id))}
        aria-label={`Remove check-in for ${member.firstName} ${member.lastName}`} title="Remove check-in">
        <Undo2 size={16} />
      </button>
    </li>
  )
}

// A member in the roster. Not in yet → "Check in". Already in → a fixed pill.
function RosterRow({ member, present, time, onCheckIn, onAskRemove }) {
  return (
    <li
      className={`sm-row ${present ? 'present' : 'clickable'}`}
      onClick={present ? undefined : () => onCheckIn(member)}
    >
      <span className="sm-avatar">{initialsOf(member)}</span>
      <span className="sm-card-text">
        <span className="sm-card-name">{member.firstName} {member.lastName}</span>
        <span className="sm-card-sub">{member.memberId}{deptName(member) ? ` · ${deptName(member)}` : ''}</span>
      </span>
      {present ? (
        <>
          <span className="sm-pill-in"><Check size={14} strokeWidth={3} /> Present{time ? ` · ${fmtClock(time)}` : ''}</span>
          <button className="sm-row-remove" onClick={() => onAskRemove(String(member._id))}
            aria-label={`Remove check-in for ${member.firstName} ${member.lastName}`} title="Remove check-in">
            <Undo2 size={16} />
          </button>
        </>
      ) : (
        <button className="sm-btn-mini" onClick={(e) => { e.stopPropagation(); onCheckIn(member) }}>
          Check in
        </button>
      )}
    </li>
  )
}

// ─── QUICK VISITOR FORM ──────────────────────
// Shown when the search finds nobody. Name + phone, press Enter, done.
function QuickVisitor({ query, service, api, onAdded, onFullMember, innerRef }) {
  const parse = (q) => {
    const typedDigits = /^[\d\s+\-()]+$/.test(q.trim())
    const parts = typedDigits ? [] : q.trim().split(/\s+/).filter(Boolean)
    return { first: parts[0] || '', last: parts.slice(1).join(' '), phone: typedDigits ? q.trim() : '' }
  }
  const init = parse(query)
  const [first, setFirst] = useState(init.first)
  const [last, setLast]   = useState(init.last)
  const [phone, setPhone] = useState(init.phone)
  const [busy, setBusy]   = useState(false)
  const [err, setErr]     = useState('')
  const touched   = useRef(false)   // once the usher edits a field, stop overwriting it
  const firstRef  = useRef(null)
  const phoneRef  = useRef(null)

  // While untouched, keep the fields in step with what is being typed in search
  useEffect(() => {
    if (touched.current) return
    const p = parse(query)
    setFirst(p.first); setLast(p.last); setPhone(p.phone)
  }, [query])

  // Lets the search box hand focus to the next empty field when Enter is pressed
  useEffect(() => {
    if (!innerRef) return
    innerRef.current = {
      focusNext: () => (phone.trim() ? firstRef.current : phoneRef.current)?.focus()
    }
    return () => { innerRef.current = null }
  }, [innerRef, phone])

  const edit = (setter) => (e) => { touched.current = true; setter(e.target.value) }

  const submit = async (e) => {
    e.preventDefault()
    if (busy) return
    if (!first.trim() || !last.trim()) { setErr('Enter first and last name.'); return }
    if (normalizePhone(phone).length < 9) { setErr('Enter a valid phone number.'); return }
    setBusy(true); setErr('')
    try {
      const data = await api('/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: first.trim(), lastName: last.trim(), phone: phone.trim(),
          serviceId: service._id,
          visitDate: service.date,
          serviceType: VISITOR_SERVICE_TYPE[service.serviceType] || 'other'
        })
      })
      if (!data.success) { setErr(data.message || 'Could not add visitor.'); return }
      onAdded(`${first.trim()} ${last.trim()}`)
    } catch {
      setErr('No connection. Try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="sm-visitor" onSubmit={submit}>
      <p className="sm-visitor-title">
        <UserPlus size={15} /> Not on the list — add as a visitor
      </p>
      <div className="sm-visitor-grid">
        <input ref={firstRef} className="sm-input-sm" placeholder="First name" value={first}
          onChange={edit(setFirst)} />
        <input className="sm-input-sm" placeholder="Last name" value={last}
          onChange={edit(setLast)} />
        <input ref={phoneRef} className="sm-input-sm" placeholder="Phone (024…)" value={phone}
          inputMode="tel" onChange={edit(setPhone)} />
        <button className="sm-btn-primary" type="submit" disabled={busy}>
          {busy ? 'Adding…' : 'Add visitor'}
        </button>
      </div>
      {err && <p className="sm-error">{err}</p>}
      <button type="button" className="sm-link" onClick={onFullMember}>
        Register as a full member instead
      </button>
    </form>
  )
}

// ═════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════
export default function ServiceMode({ service, api, onClose, onFinished, onAddMember }) {
  // ── data ──
  const [members, setMembers]       = useState([])
  const [marks, setMarks]           = useState({})
  const [times, setTimes]           = useState({})     // { memberId: ISO check-in moment }
  const [visitors, setVisitors]     = useState(0)
  const [loading, setLoading]       = useState(true)
  const [loadError, setLoadError]   = useState('')

  // ── ui ──
  const [query, setQuery]           = useState('')
  const [active, setActive]         = useState(0)       // highlighted search result
  const [tab, setTab]               = useState('arrivals') // arrivals | members
  const [rosterFilter, setRosterFilter] = useState('all') // all | notin | in
  const [arrivalsLimit, setArrivalsLimit] = useState(30)  // paging keeps the screen light
  const [rosterLimit, setRosterLimit]   = useState(25)
  const [removeTarget, setRemoveTarget] = useState(null)  // memberId waiting for "remove check-in?" confirm
  const [bulkConfirm, setBulkConfirm]   = useState(false)
  const [deptFilter, setDeptFilter] = useState('')
  const [menuOpen, setMenuOpen]     = useState(false)
  const [view, setView]             = useState('work')  // work | summary
  const [finished, setFinished]     = useState(false)   // true once Finish was pressed
  const [celebrate, setCelebrate]   = useState(null)    // { key, first, time } → the congratulations card
  const [celebrateOn, setCelebrateOn] = useState(() => localStorage.getItem('ministryos_celebrate') !== 'off')
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [toast, setToast]           = useState(null)    // { text, tone, undo? }
  const [flashId, setFlashId]       = useState(null)
  const [saveState, setSaveState]   = useState('saved') // saved | saving | error | offline
  const [soundOn, setSoundOn]       = useState(() => localStorage.getItem('ministryos_sound') !== 'off')

  // ── refs (latest values for timers) ──
  const marksRef    = useRef({})
  const timesRef    = useRef({})
  const celebrateTimer = useRef(null)
  const celebrateRef  = useRef(celebrateOn)
  const savedRef    = useRef({})
  const inflight    = useRef(false)
  const saveTimer   = useRef(null)
  const toastTimer  = useRef(null)
  const flashTimer  = useRef(null)
  const inputRef    = useRef(null)
  const visitorRef  = useRef(null)   // lets Enter in search jump into the visitor form
  const soundRef    = useRef(soundOn)
  const flushRef    = useRef(null)   // timers call flushRef.current() so they always use the latest flush
  useEffect(() => { soundRef.current = soundOn }, [soundOn])
  useEffect(() => { celebrateRef.current = celebrateOn }, [celebrateOn])

  const focusSearch = () => setTimeout(() => inputRef.current?.focus(), 0)

  // Lock page scroll behind the full-screen layer
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ───────── LOAD ─────────
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [membersRes, recordsRes] = await Promise.all([
          api('/attendance/members/list'),                       // ALL members, filtered client-side
          api(`/attendance/records?serviceId=${service._id}`)
        ])
        if (cancelled) return
        if (!membersRes.success) { setLoadError('Failed to load members.'); return }

        const existing = {}
        const existingTimes = {}
        if (recordsRes.success && Array.isArray(recordsRes.records)) {
          recordsRes.records.forEach(r => {
            const id = r.memberId?._id ? String(r.memberId._id) : String(r.memberId)
            if (r.status === 'present' || r.status === 'absent') existing[id] = r.status
            if (r.status === 'present' && r.checkedInAt) existingTimes[id] = r.checkedInAt
          })
          setVisitors(recordsRes.summary?.visitors || 0)
        }
        marksRef.current = { ...existing }
        savedRef.current = { ...existing }
        timesRef.current = { ...existingTimes }
        setTimes({ ...existingTimes })
        setMarks({ ...existing })
        setMembers(membersRes.members)
      } catch {
        if (!cancelled) setLoadError('Failed to load attendance. Check your connection and try again.')
      } finally {
        if (!cancelled) { setLoading(false); focusSearch() }
      }
    })()
    return () => { cancelled = true }
  }, [api, service._id])

  // ───────── TOAST ─────────
  const showToast = useCallback((text, tone = 'ok', undo = null) => {
    clearTimeout(toastTimer.current)
    setToast({ text, tone, undo })
    toastTimer.current = setTimeout(() => setToast(null), 5000)
  }, [])

  // ───────── AUTOSAVE ─────────
  const getDirty = () => {
    const out = []
    for (const [id, status] of Object.entries(marksRef.current)) {
      if (savedRef.current[id] !== status) {
        out.push({
          memberId: id, status,
          // the real moment of the tap → server stores it as checkedInAt
          ...(status === 'present' && timesRef.current[id] ? { checkedInAt: timesRef.current[id] } : {})
        })
      }
    }
    return out
  }

  const flush = useCallback(async () => {
    clearTimeout(saveTimer.current)
    if (inflight.current) return true
    const dirty = getDirty()
    if (dirty.length === 0) { setSaveState('saved'); return true }
    if (!navigator.onLine) { setSaveState('offline'); return false }

    inflight.current = true
    setSaveState('saving')
    let data
    try {
      data = await api('/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service._id, records: dirty })
      })
    } catch {
      // Network problem → keep the marks, retry quietly
      inflight.current = false
      setSaveState('error')
      saveTimer.current = setTimeout(() => flushRef.current?.(), RETRY_EVERY)
      return false
    }

    inflight.current = false
    if (!data.success) {
      // The SERVER said no (e.g. a future-dated service). Retrying won't help.
      setSaveState('error')
      showToast(data.message || 'The server rejected this save.', 'warn')
      return false
    }

    // Server now has exactly what we sent
    const next = { ...savedRef.current }
    dirty.forEach(d => { next[d.memberId] = d.status })
    savedRef.current = next
    // Anything tapped while we were saving? Go again.
    if (getDirty().length > 0) saveTimer.current = setTimeout(() => flushRef.current?.(), AUTOSAVE_DELAY)
    else setSaveState('saved')
    return true
  }, [api, service._id, showToast])

  // Keep the ref pointing at the newest flush
  useEffect(() => { flushRef.current = flush }, [flush])

  const scheduleSave = useCallback(() => {
    setSaveState('saving')
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => flushRef.current?.(), AUTOSAVE_DELAY)
  }, [])

  // Save the moment the connection comes back
  useEffect(() => {
    const goOnline = () => flush()
    const goOffline = () => setSaveState('offline')
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [flush])

  // Clean up timers on unmount
  useEffect(() => () => {
    clearTimeout(saveTimer.current); clearTimeout(toastTimer.current); clearTimeout(flashTimer.current); clearTimeout(celebrateTimer.current)
  }, [])

  // ───────── LIVE SYNC (other ushers / devices) ─────────
  useEffect(() => {
    if (loading || loadError) return
    const tick = async () => {
      if (document.hidden || !navigator.onLine || inflight.current) return
      try {
        const res = await api(`/attendance/records?serviceId=${service._id}`)
        if (!res.success || !Array.isArray(res.records)) return
        const nextMarks = { ...marksRef.current }
        const nextSaved = { ...savedRef.current }
        const nextTimes = { ...timesRef.current }
        res.records.forEach(r => {
          const id = r.memberId?._id ? String(r.memberId._id) : String(r.memberId)
          if (r.status !== 'present' && r.status !== 'absent') return
          const locallyDirty = nextMarks[id] !== undefined && nextMarks[id] !== nextSaved[id]
          nextSaved[id] = r.status
          if (!locallyDirty) {                       // never overwrite what THIS usher just tapped
            nextMarks[id] = r.status
            if (r.status === 'present' && r.checkedInAt) nextTimes[id] = r.checkedInAt
            else delete nextTimes[id]
          }
        })
        savedRef.current = nextSaved
        marksRef.current = nextMarks
        timesRef.current = nextTimes
        setMarks(nextMarks)
        setTimes(nextTimes)
        setVisitors(res.summary?.visitors || 0)
      } catch { /* next tick will try again */ }
    }
    const t = setInterval(tick, POLL_EVERY)
    return () => clearInterval(t)
  }, [api, service._id, loading, loadError])

  // ───────── MARKING ─────────
  // Single place that changes a mark, so autosave always follows.
  const applyMark = useCallback((id, next) => {
    const updated = { ...marksRef.current }
    if (next === undefined) delete updated[id]
    else updated[id] = next
    marksRef.current = updated
    setMarks(updated)

    // Present → stamp the exact moment (keep the first one). Anything else → clear it.
    const nextTimes = { ...timesRef.current }
    if (next === 'present') { if (!nextTimes[id]) nextTimes[id] = new Date().toISOString() }
    else delete nextTimes[id]
    timesRef.current = nextTimes
    setTimes(nextTimes)

    scheduleSave()
  }, [scheduleSave])

  // ── Congratulations card: "You've been marked present" ──
  const showCelebration = useCallback((member) => {
    if (!celebrateRef.current) return
    clearTimeout(celebrateTimer.current)
    setCelebrate({
      key: Date.now(),
      first: member.firstName,
      full: `${member.firstName} ${member.lastName}`,
      time: timesRef.current[String(member._id)] || new Date().toISOString()
    })
    celebrateTimer.current = setTimeout(() => setCelebrate(null), 2800)
  }, [])

  const flashCard = (id) => {
    setFlashId(id)
    clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setFlashId(null), 1200)
  }

  const membersById = useMemo(() => {
    const map = {}
    members.forEach(m => { map[String(m._id)] = m })
    return map
  }, [members])

  // Removing a check-in is deliberate: it only happens after the confirm dialog.
  const confirmRemove = () => {
    const id = removeTarget
    setRemoveTarget(null)
    if (!id) return
    const m = membersById[id]
    applyMark(id, savedRef.current[id] ? 'absent' : undefined)
    if (soundRef.current) beep('dup')
    showToast(`${m ? `${m.firstName} ${m.lastName}` : 'Member'}'s check-in was removed`, 'warn')
  }

  // ───────── SEARCH ─────────
  const index   = useMemo(() => buildIndex(members), [members])
  const results = useMemo(() => searchIndex(index, query), [index, query])
  const updateQuery = (value) => { setQuery(value); setActive(0) }

  const checkIn = (member, fromSearch = true) => {
    const id = String(member._id)
    const name = `${member.firstName} ${member.lastName}`
    const prev = marksRef.current[id]
    if (prev === 'present') {
      if (soundRef.current) beep('dup')
      showToast(`${name} is already checked in`, 'warn')
    } else {
      applyMark(id, 'present')
      if (soundRef.current) beep('ok')
      buzz()
      flashCard(id)
      showCelebration(member)
      showToast(`${name} checked in`, 'ok', () => {
        applyMark(id, prev === undefined ? (savedRef.current[id] ? 'absent' : undefined) : prev)
        setCelebrate(null)
      })
    }
    if (fromSearch) {            // roster taps leave the search box (and phone keyboard) alone
      updateQuery('')
      focusSearch()
    }
  }

  const onSearchKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[active]) checkIn(results[active])
      else visitorRef.current?.focusNext()   // nobody found → continue as visitor
    }
    else if (e.key === 'Escape') { updateQuery('') }
  }

  // ───────── DERIVED DATA ─────────
  const inDept = useCallback((m) => {
    if (!deptFilter) return true
    return String(m.departmentId?._id || 'none') === deptFilter
  }, [deptFilter])

  // Live arrivals: everyone present, newest check-in first
  const presentList = useMemo(() => {
    const list = members.filter(m => marks[String(m._id)] === 'present')
    const t = (m) => (times[String(m._id)] ? new Date(times[String(m._id)]).getTime() : 0)
    list.sort((a, b) => t(b) - t(a))
    return list
  }, [members, marks, times])

  // Roster for the Members tab (department + status filters)
  const roster = useMemo(() => members.filter(m => {
    if (!inDept(m)) return false
    const present = marks[String(m._id)] === 'present'
    if (rosterFilter === 'in')    return present
    if (rosterFilter === 'notin') return !present
    return true
  }), [members, marks, rosterFilter, inDept])

  const counts = useMemo(() => {
    const present = presentList.length
    return { present, notIn: members.length - present, total: members.length }
  }, [presentList, members])

  // Numbers for the currently chosen department (or everyone)
  const scoped = useMemo(() => {
    const scope = members.filter(inDept)
    const present = scope.filter(m => marks[String(m._id)] === 'present').length
    return { total: scope.length, present, notIn: scope.length - present }
  }, [members, marks, inDept])

  // Department panel: live progress per department, built from the members themselves
  const deptStats = useMemo(() => {
    const map = new Map()
    members.forEach(m => {
      const id = String(m.departmentId?._id || 'none')
      const name = m.departmentId?.name || 'No department'
      if (!map.has(id)) map.set(id, { id, name, total: 0, present: 0 })
      const row = map.get(id)
      row.total++
      if (marks[String(m._id)] === 'present') row.present++
    })
    return [...map.values()].sort((a, b) =>
      (a.id === 'none') - (b.id === 'none') || a.name.localeCompare(b.name))
  }, [members, marks])

  const activeDept = deptStats.find(d => d.id === deptFilter)
  const pct = counts.total ? Math.round((counts.present / counts.total) * 100) : 0

  const changeDept = (id) => { setDeptFilter(id); setRosterLimit(25) }
  const changeRosterFilter = (f) => { setRosterFilter(f); setRosterLimit(25) }

  // ───────── BULK + FINISH ─────────
  // Checks in a whole department at once (e.g. choir rehearsal). Only offered when
  // ONE department is selected, and always behind a confirm, so it can never
  // mark all 500 members by accident.
  const bulkCandidates = deptFilter ? members.filter(m => inDept(m) && marks[String(m._id)] !== 'present') : []

  const doBulkCheckIn = () => {
    const stamp = new Date().toISOString()
    const updated = { ...marksRef.current }
    const nextTimes = { ...timesRef.current }
    members.forEach(m => {
      const id = String(m._id)
      if (inDept(m) && updated[id] !== 'present') { updated[id] = 'present'; nextTimes[id] = stamp }
    })
    marksRef.current = updated
    timesRef.current = nextTimes
    setMarks(updated)
    setTimes(nextTimes)
    scheduleSave()
    setBulkConfirm(false)
    showToast(`${bulkCandidates.length} checked in from ${activeDept?.name || 'this department'}`)
  }

  const doFinish = async () => {
    // Unmarked → absent (this is the ONLY place absent is created automatically)
    const updated = { ...marksRef.current }
    members.forEach(m => { if (!updated[String(m._id)]) updated[String(m._id)] = 'absent' })
    marksRef.current = updated
    setMarks(updated)
    setConfirmFinish(false)

    inflight.current = false
    const ok = await flush()
    if (!ok) { showToast('Could not save yet — check your connection and try Finish again', 'warn'); return }
    onFinished?.(`Attendance saved. ${counts.present} of ${counts.total} present.`)
    setFinished(true)
    setView('summary')
  }

  const handleFinishClick = () => {
    if (counts.notIn > 0) setConfirmFinish(true)
    else doFinish()
  }

  const handleClose = async () => {
    // Let any save that is already on its way finish first (max ~3s)
    for (let i = 0; i < 15 && inflight.current; i++) await new Promise(r => setTimeout(r, 200))
    const ok = await flush()
    if (!ok && getDirty().length > 0) {
      if (!window.confirm('Some check-ins have not been saved yet. Close anyway and lose them?')) return
    }
    onClose()
  }

  // ───────── RENDER ─────────
  if (view === 'summary') {
    return (
      <div className="sm-root light">
        <div className="sm-summary-wrap">
          <AttendanceSummary
            service={service}
            members={members}
            attendance={marks}
            times={times}
            finished={finished}
            initialTab={finished ? 'absent' : 'present'}
            onClose={() => setView('work')}
            onDone={finished ? onClose : undefined}
          />
        </div>
      </div>
    )
  }

  const saveLabel = {
    saved:   ['All changes saved', 'ok',   <CheckCircle size={14} key="i" />],
    saving:  ['Saving…',           'busy', <Loader2 size={14} className="sm-spin" key="i" />],
    error:   ["Couldn't save — retrying", 'bad', <AlertTriangle size={14} key="i" />],
    offline: ['Offline — will sync', 'bad', <WifiOff size={14} key="i" />]
  }[saveState]

  const showNoMatch = query.trim().length >= 2 && results.length === 0

  return (
    <div className="sm-root" role="dialog" aria-label="Take attendance">

      {/* ═════ HERO TOP BAR ═════ */}
      <header className="sm-top">
        <div className="sm-top-row">
          <button className="sm-icon-btn glass" onClick={handleClose} aria-label="Close attendance">
            <X size={20} />
          </button>

          <div className="sm-title">
            <h2>{service.name}</h2>
            <p>
              {fmtDate(service.date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              {service.time ? ` · ${service.time}` : ''}
            </p>
          </div>

          <div className="sm-top-actions">
            <span className={`sm-save ${saveLabel[1]}`}>
              {saveLabel[2]} <span className="sm-save-text">{saveLabel[0]}</span>
            </span>

            {/* View Summary is now a real, visible button */}
            <button className="sm-btn-glass sm-hide-mobile" onClick={() => setView('summary')} disabled={loading || !!loadError}>
              <ClipboardList size={17} /> Summary
            </button>

            <div className="sm-menu-wrap">
              <button className="sm-icon-btn glass" onClick={() => setMenuOpen(o => !o)} aria-label="More options">
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && <div className="sm-menu-backdrop" onClick={() => setMenuOpen(false)} />}
              {menuOpen && (
                <div className="sm-menu">
                  <button
                    onClick={() => { setMenuOpen(false); setBulkConfirm(true) }}
                    disabled={!deptFilter || bulkCandidates.length === 0}
                    title={deptFilter ? '' : 'Pick a department first (Members tab)'}
                  >
                    <Users size={15} /> {deptFilter ? `Check in all of ${activeDept?.name || 'department'}` : 'Check in a whole department'}
                  </button>
                  <button onClick={() => {
                    const next = !celebrateOn
                    setCelebrateOn(next)
                    localStorage.setItem('ministryos_celebrate', next ? 'on' : 'off')
                    setMenuOpen(false)
                  }}>
                    <Sparkles size={15} /> Congratulations card: {celebrateOn ? 'On' : 'Off'}
                  </button>
                  <button onClick={() => {
                    const next = !soundOn
                    setSoundOn(next)
                    localStorage.setItem('ministryos_sound', next ? 'on' : 'off')
                    setMenuOpen(false)
                  }}>
                    {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />} Sound: {soundOn ? 'On' : 'Off'}
                  </button>
                </div>
              )}
            </div>

            <button className="sm-btn-white sm-hide-mobile" onClick={handleFinishClick} disabled={loading || !!loadError}>
              Finish
            </button>
          </div>
        </div>

        {/* Live counters */}
        <div className="sm-stats">
          <div className="sm-stat main">
            <strong>{counts.present}<small>/{counts.total}</small></strong>
            <span>Present</span>
          </div>
          <div className="sm-stat">
            <strong>{counts.notIn}</strong><span>Not yet in</span>
          </div>
          <div className="sm-stat">
            <strong>{visitors}</strong><span>Visitors</span>
          </div>
          <div className="sm-stat">
            <strong>{pct}%</strong><span>Attendance</span>
          </div>
        </div>

        <div className="sm-progress" aria-hidden="true"><div style={{ width: `${pct}%` }} /></div>
      </header>

      {/* ═════ BODY ═════ */}
      <main className="sm-body">
        {loading ? (
          <LoadingSpinner message="Loading members…" />
        ) : loadError ? (
          <div className="sm-empty">
            <p>{loadError}</p>
            <button className="sm-btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="sm-layout">
              <div className="sm-main">
                {/* ── SEARCH (always focused) ── */}
                <section className="sm-search">
                  <div className="sm-search-box">
                    <Search size={22} />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={e => updateQuery(e.target.value)}
                      onKeyDown={onSearchKey}
                      placeholder="Name, ID (28) or phone — then Enter"
                      autoFocus
                      autoComplete="off"
                      enterKeyHint="done"
                      aria-label="Search member to check in"
                    />
                    {query && (
                      <button className="sm-clear" onClick={() => { updateQuery(''); focusSearch() }} aria-label="Clear search">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {results.length > 0 && (
                    <ul className="sm-results" role="listbox">
                      {results.map((m, i) => {
                        const isPresent = marks[String(m._id)] === 'present'
                        return (
                          <li key={m._id}>
                            <button
                              type="button"
                              role="option"
                              aria-selected={i === active}
                              className={`sm-result ${i === active ? 'active' : ''}`}
                              onMouseEnter={() => setActive(i)}
                              onClick={() => checkIn(m)}
                            >
                              <span className="sm-avatar">{initialsOf(m)}</span>
                              <span className="sm-card-text">
                                <span className="sm-card-name">{m.firstName} {m.lastName}</span>
                                <span className="sm-card-sub">
                                  {m.memberId}{m.phone ? ` · ${m.phone}` : ''}
                                  {m.departmentId?.name ? ` · ${m.departmentId.name}` : ''}
                                </span>
                              </span>
                              {isPresent
                                ? <span className="sm-tag ok">Already in</span>
                                : <span className="sm-tag">{i === active ? 'Enter ↵' : 'Check in'}</span>}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {showNoMatch && (
                    <QuickVisitor
                      query={query}
                      innerRef={visitorRef}
                      service={service}
                      api={api}
                      onFullMember={() => onAddMember?.(query)}
                      onAdded={(name) => {
                        setVisitors(v => v + 1)
                        updateQuery('')
                        showToast(`Visitor ${name} added. Welcome follow-up is in Visitors.`)
                        focusSearch()
                      }}
                    />
                  )}
                </section>


                {/* ── TABS ── */}
                <div className="sm-tabs" role="tablist">
                  <button role="tab" aria-selected={tab === 'arrivals'} className={tab === 'arrivals' ? 'on' : ''}
                    onClick={() => setTab('arrivals')}>
                    Live arrivals <em>{counts.present}</em>
                  </button>
                  <button role="tab" aria-selected={tab === 'members'} className={tab === 'members' ? 'on' : ''}
                    onClick={() => setTab('members')}>
                    Members <em>{counts.total}</em>
                  </button>
                </div>

                {tab === 'arrivals' ? (
                  /* ── LIVE ARRIVALS ── */
                  <section className="sm-panel">
                    <header className="sm-panel-head">
                      <h3>Checked in</h3>
                      <span className="sm-live"><i /> Live</span>
                    </header>

                    {presentList.length === 0 ? (
                      <div className="sm-arrivals-empty">
                        <span className="sm-empty-icon"><Search size={26} /></span>
                        <strong>Ready for check-in</strong>
                        <p>Search a name above. Each person appears here the moment they are checked in.</p>
                      </div>
                    ) : (
                      <ul className="sm-list">
                        {presentList.slice(0, arrivalsLimit).map(m => (
                          <ArrivalRow
                            key={m._id}
                            member={m}
                            time={times[String(m._id)]}
                            flash={flashId === String(m._id)}
                            onAskRemove={setRemoveTarget}
                          />
                        ))}
                      </ul>
                    )}

                    {presentList.length > arrivalsLimit && (
                      <button className="sm-more" onClick={() => setArrivalsLimit(n => n + 30)}>
                        <ChevronDown size={16} /> Show 30 more ({presentList.length - arrivalsLimit} remaining)
                      </button>
                    )}
                  </section>
                ) : (
                  /* ── MEMBERS ROSTER ── */
                  <section className="sm-panel">
                    <header className="sm-panel-head sm-roster-head">
                      <div className="sm-seg" role="tablist">
                        {[
                          ['all',   'All',        scoped.total],
                          ['notin', 'Not yet in', scoped.notIn],
                          ['in',    'Checked in', scoped.present]
                        ].map(([key, label, n]) => (
                          <button key={key} role="tab" aria-selected={rosterFilter === key}
                            className={rosterFilter === key ? 'on' : ''} onClick={() => changeRosterFilter(key)}>
                            {label} <em>{n}</em>
                          </button>
                        ))}
                      </div>
                      <select className="sm-select" value={deptFilter}
                        onChange={e => changeDept(e.target.value)} aria-label="Filter by department">
                        <option value="">All departments</option>
                        {deptStats.map(d => <option key={d.id} value={d.id}>{d.name} ({d.present}/{d.total})</option>)}
                      </select>
                    </header>

                    {members.length === 0 ? (
                      <p className="sm-sum-empty">No active members to mark attendance for.</p>
                    ) : roster.length === 0 ? (
                      <p className="sm-sum-empty">
                        {rosterFilter === 'notin' ? 'Everyone here has been checked in. 🎉' : 'Nobody to show for this filter.'}
                      </p>
                    ) : (
                      <ul className="sm-list">
                        {roster.slice(0, rosterLimit).map(m => {
                          const id = String(m._id)
                          return (
                            <RosterRow
                              key={id}
                              member={m}
                              present={marks[id] === 'present'}
                              time={times[id]}
                              onCheckIn={(mm) => checkIn(mm, false)}
                              onAskRemove={setRemoveTarget}
                            />
                          )
                        })}
                      </ul>
                    )}

                    {roster.length > rosterLimit && (
                      <button className="sm-more" onClick={() => setRosterLimit(n => n + 25)}>
                        <ChevronDown size={16} /> Show 25 more ({roster.length - rosterLimit} remaining)
                      </button>
                    )}
                  </section>
                )}
              </div>

              {/* ── DEPARTMENT PROGRESS (desktop side panel) ── */}
              <aside className="sm-aside" aria-label="Attendance by department">
                <h3>By department</h3>
                <button className={`sm-dept ${!deptFilter ? 'on' : ''}`} onClick={() => { changeDept(''); setTab('members') }}>
                  <span className="sm-dept-top"><span>Everyone</span><strong>{counts.present}/{counts.total}</strong></span>
                  <span className="sm-dept-bar"><span style={{ width: `${pct}%` }} /></span>
                </button>
                {deptStats.map(d => (
                  <button key={d.id} className={`sm-dept ${deptFilter === d.id ? 'on' : ''}`}
                    onClick={() => { changeDept(d.id); setTab('members') }}>
                    <span className="sm-dept-top"><span>{d.name}</span><strong>{d.present}/{d.total}</strong></span>
                    <span className="sm-dept-bar"><span style={{ width: `${d.total ? Math.round((d.present / d.total) * 100) : 0}%` }} /></span>
                  </button>
                ))}
              </aside>
            </div>
          </>
        )}
      </main>

      {/* ═════ MOBILE BOTTOM BAR (thumb-reachable) ═════ */}
      <nav className="sm-bottom" aria-label="Attendance actions">
        <button className="sm-btn-ghost" onClick={() => setView('summary')} disabled={loading || !!loadError}>
          <ClipboardList size={18} /> Summary
        </button>
        <button className="sm-btn-primary" onClick={handleFinishClick} disabled={loading || !!loadError}>
          Finish
        </button>
      </nav>

      {/* ═════ CONGRATULATIONS: you've been marked present ═════ */}
      {celebrate && (
        <div className="sm-celebrate" key={celebrate.key} role="status" aria-live="polite">
          <div className="sm-celebrate-card">
            <div className="sm-confetti" aria-hidden="true">
              {CONFETTI.map((c, i) => (
                <i key={i} style={{ '--x': `${c.x}px`, '--r': `${c.r}deg`, '--d': `${c.d}s`, '--c': c.c }} />
              ))}
            </div>
            <div className="sm-celebrate-badge"><Check size={36} strokeWidth={3.5} /></div>
            <h3>Congratulations, {celebrate.first}! 🎉</h3>
            <p>You have been marked present</p>
            <span className="sm-celebrate-time"><Clock size={14} /> {fmtClock(celebrate.time, true)}</span>
          </div>
        </div>
      )}

      {/* ═════ UNDO / INFO TOAST ═════ */}
      {toast && (
        <div className={`sm-toast ${toast.tone}`} role="status">
          <span>{toast.text}</span>
          {toast.undo && (
            <button onClick={() => { toast.undo(); setToast(null); focusSearch() }}>
              <Undo2 size={14} /> Undo
            </button>
          )}
        </div>
      )}

      {/* ═════ REMOVE A CHECK-IN (always asks) ═════ */}
      {removeTarget && membersById[removeTarget] && (
        <div className="sm-confirm-wrap" onClick={() => setRemoveTarget(null)}>
          <div className="sm-confirm" onClick={e => e.stopPropagation()}>
            <h3>Remove this check-in?</h3>
            <p>
              <strong>{membersById[removeTarget].firstName} {membersById[removeTarget].lastName}</strong>
              {times[removeTarget] ? <> was checked in at <strong>{fmtClock(times[removeTarget], true)}</strong>.</> : ' is checked in.'}
              {' '}Removing it marks them as not present.
            </p>
            <div className="sm-confirm-actions">
              <button className="sm-btn-ghost" onClick={() => setRemoveTarget(null)}>Keep checked in</button>
              <button className="sm-btn-danger" onClick={confirmRemove}>Remove check-in</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════ CHECK IN A WHOLE DEPARTMENT ═════ */}
      {bulkConfirm && (
        <div className="sm-confirm-wrap" onClick={() => setBulkConfirm(false)}>
          <div className="sm-confirm" onClick={e => e.stopPropagation()}>
            <h3>Check in {activeDept?.name}?</h3>
            <p>
              This checks in <strong>{bulkCandidates.length}</strong> member{bulkCandidates.length !== 1 ? 's' : ''} from
              {' '}<strong>{activeDept?.name}</strong> who are not in yet, all at {fmtClock(new Date().toISOString())}.
            </p>
            <div className="sm-confirm-actions">
              <button className="sm-btn-ghost" onClick={() => setBulkConfirm(false)}>Cancel</button>
              <button className="sm-btn-primary" onClick={doBulkCheckIn}>Check them all in</button>
            </div>
          </div>
        </div>
      )}

      {/* ═════ FINISH CONFIRM ═════ */}
      {confirmFinish && (
        <div className="sm-confirm-wrap" onClick={() => setConfirmFinish(false)}>
          <div className="sm-confirm" onClick={e => e.stopPropagation()}>
            <h3>Finish this service?</h3>
            <p>
              <strong>{counts.notIn}</strong> member{counts.notIn !== 1 ? 's have' : ' has'} not been
              checked in and will be recorded as <strong>Absent</strong>. You'll then see the follow-up list.
            </p>
            <div className="sm-confirm-actions">
              <button className="sm-btn-ghost" onClick={() => setConfirmFinish(false)}>Keep marking</button>
              <button className="sm-btn-primary" onClick={doFinish}>Finish &amp; see follow-up</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
