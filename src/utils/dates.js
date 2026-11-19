// dates.js — MinistryOS
// Located at: client/src/utils/dates.js
// ───────────────────────────────────────
// The ONE place the app formats and reads dates.
//
// WHY: a service, event, birthday or offering date picked in a date field is
// saved as a calendar date at UTC midnight (e.g. 2026-11-01T00:00:00.000Z).
// Formatting that in a US browser (UTC-5/-8) shows the PREVIOUS day.
// Real moments in time (createdAt, submittedAt ...) must still be shown in
// the viewer's own timezone. We tell them apart: a value sitting exactly on
// UTC midnight is a calendar date; anything else is a moment.

const toDate = (v) => (v instanceof Date ? v : new Date(v))

export const isCalendarDate = (v) => {
  const d = toDate(v)
  return !isNaN(d) &&
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 0
}

// Format a date for display. Calendar dates are shown in UTC (never shift a day);
// moments are shown in the viewer's timezone (or opts.timeZone if given).
export const fmtDate = (value, opts, locale) => {
  if (!value) return '—'
  const d = toDate(value)
  if (isNaN(d)) return '—'
  const o = { ...(opts || {}) }
  if (isCalendarDate(d) && !o.timeZone) o.timeZone = 'UTC'
  return d.toLocaleDateString(locale, o)
}

// Date + time. A calendar date has no time of day, so only the date is shown.
export const fmtDateTime = (value, opts, locale) => {
  if (!value) return '—'
  const d = toDate(value)
  if (isNaN(d)) return '—'
  if (isCalendarDate(d)) {
    const { timeStyle, hour, minute, second, hour12, hourCycle, dayPeriod, ...dateOnly } = opts || {}   // eslint-disable-line no-unused-vars
    return fmtDate(d, dateOnly, locale)
  }
  return d.toLocaleString(locale, opts)
}

const pad = (n) => String(n).padStart(2, '0')

// Today's date in the viewer's timezone as YYYY-MM-DD (for default values of date inputs).
// NOT new Date().toISOString() — that is the UTC date, which is "tomorrow" on a US evening.
export const todayISO = (now = new Date()) =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

// Value for <input type="date"> from a saved date (calendar date → its own day; moment → viewer's local day).
export const toDateInput = (value) => {
  if (!value) return ''
  const d = toDate(value)
  if (isNaN(d)) return ''
  return isCalendarDate(d) ? d.toISOString().slice(0, 10) : todayISO(d)
}

// Calendar parts of a saved date: { y, m (0-11), d }
export const dateParts = (value) => {
  const d = toDate(value)
  if (isCalendarDate(d)) return { y: d.getUTCFullYear(), m: d.getUTCMonth(), d: d.getUTCDate() }
  return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() }
}

// Whole days from today (viewer's calendar) to a saved date. 0 = today, 1 = tomorrow, -1 = yesterday.
export const daysFromToday = (value, now = new Date()) => {
  const p = dateParts(value)
  const a = Date.UTC(p.y, p.m, p.d)
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((a - b) / 86400000)
}
