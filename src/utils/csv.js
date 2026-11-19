// csv.js — MinistryOS
// Located at: client/src/utils/csv.js
// ─────────────────────────────────────
// Builds and downloads CSV files in the browser.
//  - quotes cells with commas, quotes or line breaks
//  - guards against spreadsheet formula injection (text starting with
//    = + - @ gets a leading apostrophe); real numbers are written as-is
//  - adds a UTF-8 BOM so Excel shows accents and symbols correctly

export const csvCell = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : ''

  let s = value instanceof Date ? value.toISOString() : String(value)
  // Guard formulas, but leave phone-number-looking text (+1 415 555 0100) untouched.
  if (/^[=+\-@\t\r]/.test(s) && !/^\+?[\d\s().-]+$/.test(s)) s = `'${s}`

  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCSV = (headers, rows) =>
  [headers, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n'

// Several small tables in one file: [{ title, headers, rows }, ...]
export const sectionsToCSV = (sections) =>
  sections
    .filter(s => s.rows && s.rows.length)
    .map(s => [csvCell(s.title), toCSV(s.headers, s.rows)].join('\r\n'))
    .join('\r\n')

export const downloadBlob = (filename, blob) => {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const downloadCSV = (filename, csvText) =>
  downloadBlob(filename, new Blob(['\uFEFF' + csvText], { type: 'text/csv;charset=utf-8' }))
