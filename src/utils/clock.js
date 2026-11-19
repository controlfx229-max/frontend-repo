// clock.js — MinistryOS
// Located at: client/src/utils/clock.js
// Formats a check-in timestamp for display, in the viewer's local time (Ghana = GMT).
//   fmtClock('2026-11-18T09:32:07Z')        → "9:32 AM"
//   fmtClock('2026-11-18T09:32:07Z', true)  → "9:32:07 AM"
export function fmtClock(iso, withSeconds = false) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    ...(withSeconds ? { second: '2-digit' } : {}),
    hour12: true
  }).replace('am', 'AM').replace('pm', 'PM')
}
