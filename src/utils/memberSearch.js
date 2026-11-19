// memberSearch.js — MinistryOS
// Located at: client/src/utils/memberSearch.js
// ───────────────────────────────────────────────────────────
// Smart member search for fast check-in at the church door.
//
// The usher should NOT need to know our ID format. All of these find
// "Emmanuel Mensah (MIN-0028, 024 412 3456)":
//   "28"  "0028"  "min-0028"      → member ID
//   "emma"  "mensah em"           → name (any order, partial words)
//   "4123456"  "0244123456"  "+233244123456"  → phone (Ghana formats)
//
// Pure functions, no React — easy to test and reuse (e.g. visitors later).

// Lowercase + strip accents so "Ama" matches "ámá"
const norm = (s = '') =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim()

// Ghana phones come as 024..., +23324..., 23324... → always compare as 0XXXXXXXXX
export const normalizePhone = (p = '') => {
  let d = String(p).replace(/\D/g, '')
  if (d.startsWith('233') && d.length >= 12) d = '0' + d.slice(3)
  return d
}

// "MIN-0028" → 28   (null if the ID doesn't follow the pattern)
const idNumber = (memberId = '') => {
  const m = /(\d+)\s*$/.exec(String(memberId))
  return m ? parseInt(m[1], 10) : null
}

// Build the search index ONCE per member list (not on every keystroke)
export function buildIndex(members) {
  return members.map(m => ({
    member: m,
    first:  norm(m.firstName),
    last:   norm(m.lastName),
    full:   norm(`${m.firstName} ${m.lastName} ${m.memberId || ''}`),
    idNum:  idNumber(m.memberId),
    phones: [normalizePhone(m.phone), normalizePhone(m.whatsapp)].filter(Boolean)
  }))
}

// Returns up to `limit` best matches, best first.
export function searchIndex(index, rawQuery, limit = 6) {
  const raw = String(rawQuery || '').trim()
  if (!raw) return []

  const compact = raw.replace(/[\s().+-]/g, '')
  const isNumeric = /^\d+$/.test(compact)
  const scored = []

  if (isNumeric) {
    const digits = normalizePhone(compact)
    const asNumber = parseInt(compact, 10)

    for (const row of index) {
      let score = 0
      // Exact member-ID number: "28" / "0028" → MIN-0028  (only short inputs)
      if (compact.length <= 5 && row.idNum !== null && row.idNum === asNumber) score = 100
      // Phone: ends-with is the most natural ("last 4–6 digits")
      if (digits.length >= 3 && row.phones.some(p => p.endsWith(digits))) score = Math.max(score, 80)
      else if (digits.length >= 4 && row.phones.some(p => p.includes(digits))) score = Math.max(score, 60)
      if (score) scored.push({ row, score })
    }
  } else {
    const tokens = norm(raw).split(/\s+/).filter(Boolean)
    for (const row of index) {
      // EVERY typed word must appear somewhere in name / ID
      if (!tokens.every(t => row.full.includes(t))) continue
      let score = 40
      if (tokens.every(t => row.first.startsWith(t) || row.last.startsWith(t))) score = 90
      else if (tokens.every(t => row.full.split(/[\s-]+/).some(w => w.startsWith(t)))) score = 70
      scored.push({ row, score })
    }
  }

  scored.sort((a, b) =>
    b.score - a.score ||
    a.row.first.localeCompare(b.row.first) ||
    a.row.last.localeCompare(b.row.last)
  )
  return scored.slice(0, limit).map(s => s.row.member)
}
