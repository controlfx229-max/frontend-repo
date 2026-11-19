// currency.js — MinistryOS
// Located at: client/src/utils/currency.js
// ─────────────────────────────────────────
// One place for formatting money. The active currency is the signed-in
// church's currency (set by AuthContext). Ghana (GHS) keeps the existing
// "GHS 1,234.00" look; every other currency uses the browser's native
// formatting (e.g. "$1,234.00").

let activeCurrency = 'GHS'

export const setActiveCurrency = (code) => {
  activeCurrency = (typeof code === 'string' && code.length === 3) ? code.toUpperCase() : 'GHS'
}

export const getCurrencyCode = () => activeCurrency

// opts.decimals — number of decimal places (default 2).
export const formatMoney = (value, currency = activeCurrency, opts = {}) => {
  const amount   = parseFloat(value || 0)
  const safe     = Number.isFinite(amount) ? amount : 0
  const decimals = Number.isInteger(opts.decimals) ? opts.decimals : 2

  if (currency === 'GHS') {
    return `GHS ${safe.toLocaleString('en-GH', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency,
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }).format(safe)
  } catch {
    return `${currency} ${safe.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
  }
}
