import { useCallback, useEffect, useMemo, useState } from 'react'
import { Download, RotateCcw, ChevronRight, ChevronDown } from 'lucide-react'
import useApi, { API_BASE } from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { useBranch } from '../../context/BranchContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { downloadBlob } from '../../utils/csv'

const LIMIT = 25

// Colour-code actions so risky events stand out at a glance.
const actionStyle = (action = '') => {
  if (/fail|delet|suspend|reject|remov|deactiv/i.test(action)) return { bg: '#FEE2E2', color: '#991B1B' }
  if (/creat|regist|approv|enabl|activ|reactiv|export/i.test(action)) return { bg: '#DCFCE7', color: '#166534' }
  if (/login|verif|2fa|password/i.test(action)) return { bg: '#DBEAFE', color: '#1E40AF' }
  return { bg: '#F1F5F9', color: '#475569' }
}

const ActionBadge = ({ action }) => {
  const s = actionStyle(action)
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '2px 8px', borderRadius: 999,
      fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap'
    }}>
      {action}
    </span>
  )
}

const hasDetails = (d) => d && typeof d === 'object' && Object.keys(d).length > 0

export default function AuditLog() {
  const { api, branchReady } = useApi()
  const { apiFetch } = useAuth()
  const { branchHeader } = useBranch()

  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [tz, setTz]           = useState('')
  const [exporting, setExporting] = useState(false)
  const [expanded, setExpanded]   = useState(null)

  const [options, setOptions] = useState({ actions: [], users: [] })
  const [filters, setFilters] = useState({ q: '', action: '', user: '', from: '', to: '' })
  const [debouncedQ, setDebouncedQ] = useState('')

  // Wait for the person to stop typing before searching.
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(filters.q.trim()); setPage(1) }, 400)
    return () => clearTimeout(t)
  }, [filters.q])

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    if (key !== 'q') setPage(1)
  }

  const resetFilters = () => {
    setFilters({ q: '', action: '', user: '', from: '', to: '' })
    setDebouncedQ('')
    setPage(1)
  }

  const filtersActive = Boolean(filters.q || filters.action || filters.user || filters.from || filters.to)

  // Query string shared by the list and the CSV export.
  const filterQuery = useMemo(() => {
    const p = new URLSearchParams()
    if (debouncedQ)     p.set('q', debouncedQ)
    if (filters.action) p.set('action', filters.action)
    if (filters.user)   p.set('user', filters.user)
    if (filters.from)   p.set('from', filters.from)
    if (filters.to)     p.set('to', filters.to)
    return p.toString()
  }, [debouncedQ, filters.action, filters.user, filters.from, filters.to])

  // Dropdown options (once)
  useEffect(() => {
    if (!branchReady) return
    api('/audit/filters')
      .then(d => { if (d.success) setOptions({ actions: d.filters.actions, users: d.filters.users }) })
      .catch(() => null)
  }, [api, branchReady])

  const fetchLogs = useCallback(async () => {
    if (!branchReady) return
    setLoading(true)
    setError('')
    try {
      const data = await api(`/audit?page=${page}&limit=${LIMIT}${filterQuery ? `&${filterQuery}` : ''}`)
      if (!data.success) {
        setError(data.message || 'Unable to load audit logs.')
        setLogs([])
        return
      }
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      if (data.timezone) setTz(data.timezone)
    } catch {
      setError('Unable to load audit logs.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [api, branchReady, page, filterQuery])

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchLogs() }, [fetchLogs])

  const formatTime = (value) => {
    const d = new Date(value)
    try {
      return d.toLocaleString(undefined, { timeZone: tz || undefined, dateStyle: 'medium', timeStyle: 'short' })
    } catch {
      return d.toLocaleString()
    }
  }

  const handleExport = async () => {
    setExporting(true)
    setError('')
    try {
      const res = await apiFetch(`${API_BASE}/audit/export${filterQuery ? `?${filterQuery}` : ''}`, {
        headers: { 'X-Branch-Id': branchHeader }
      })
      if (!res.ok) {
        const j = await res.json().catch(() => null)
        setError(j?.message || 'Export failed. You may not have permission to export.')
        return
      }
      const blob = await res.blob()
      downloadBlob(`ministryos-audit-log-${new Date().toISOString().slice(0, 10)}.csv`, blob)
    } catch {
      setError('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const pages = Math.max(1, Math.ceil(total / LIMIT))
  const who   = (log) => log.userName || log.userId?.name || 'Unknown'
  const what  = (log) => `${log.resourceType || ''}${log.resourceId ? ` (${String(log.resourceId).slice(0, 8)})` : ''}`

  const fieldStyle = { minWidth: 140 }

  return (
    <div className="members-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">
            Track who performed key actions across your church system
            {tz ? ` · times shown in ${tz.replace(/_/g, ' ')}` : ''}.
          </p>
        </div>
        <button className="btn-ghost" onClick={handleExport} disabled={exporting || total === 0}
          title="Download the records matching your filters as a CSV file (up to 10,000, newest first)">
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="members-content" style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label className="form-label">Search</label>
            <input className="form-input" placeholder="Name, action or description…"
              value={filters.q} onChange={e => setFilter('q', e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Action</label>
            <select className="form-input" value={filters.action} onChange={e => setFilter('action', e.target.value)}>
              <option value="">All actions</option>
              {options.actions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label className="form-label">User</label>
            <select className="form-input" value={filters.user} onChange={e => setFilter('user', e.target.value)}>
              <option value="">All users</option>
              {options.users.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label className="form-label">From</label>
            <input className="form-input" type="date" value={filters.from} max={filters.to || undefined}
              onChange={e => setFilter('from', e.target.value)} />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">To</label>
            <input className="form-input" type="date" value={filters.to} min={filters.from || undefined}
              onChange={e => setFilter('to', e.target.value)} />
          </div>
          {filtersActive && (
            <button className="btn-ghost" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Loading audit log..." />
      ) : error ? (
        <div className="members-content" style={{ padding: 'var(--space-5)' }}>
          <p style={{ color: 'var(--danger)', fontWeight: '600' }}>{error}</p>
        </div>
      ) : (
        <div className="members-content">
          <div className="table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th style={{ width: 28 }}></th>
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Description</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: 'var(--space-5)' }}>
                      {filtersActive ? 'No records match these filters.' : 'No audit records found.'}
                    </td>
                  </tr>
                ) : logs.map((log) => {
                  const open = expanded === log._id
                  const expandable = hasDetails(log.details)
                  return (
                    <FragmentRows key={log._id}>
                      <tr className="member-row" style={{ cursor: expandable ? 'pointer' : 'default' }}
                        onClick={() => expandable && setExpanded(open ? null : log._id)}>
                        <td>{expandable && (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}</td>
                        <td>{formatTime(log.createdAt)}</td>
                        <td>
                          {who(log)}
                          {log.userRole && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{log.userRole}</div>}
                        </td>
                        <td><ActionBadge action={log.action} /></td>
                        <td>{what(log)}</td>
                        <td>{log.description}</td>
                        <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{log.ipAddress || '—'}</td>
                      </tr>
                      {open && (
                        <tr>
                          <td></td>
                          <td colSpan="6" style={{ paddingBottom: 'var(--space-3)' }}>
                            <pre style={{
                              margin: 0, padding: 'var(--space-3)', background: 'var(--surface-2, #F8FAFC)',
                              borderRadius: 8, fontSize: 12, overflowX: 'auto'
                            }}>{JSON.stringify(log.details, null, 2)}</pre>
                          </td>
                        </tr>
                      )}
                    </FragmentRows>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile-friendly list (visible on small screens) */}
          <div className="audit-cards-list">
            {logs.length === 0 ? (
              <div style={{ padding: 'var(--space-5)' }}>
                {filtersActive ? 'No records match these filters.' : 'No audit records found.'}
              </div>
            ) : (
              logs.map((log) => (
                <div className="audit-card" key={log._id}>
                  <div className="audit-card-row">
                    <div className="audit-time">{formatTime(log.createdAt)}</div>
                    <div className="audit-user">{who(log)}</div>
                  </div>
                  <div className="audit-action-row">
                    <ActionBadge action={log.action} />
                    <div className="audit-resource">{what(log)}</div>
                  </div>
                  <div className="audit-desc">{log.description}</div>
                  {log.ipAddress && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>IP {log.ipAddress}</div>
                  )}
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {logs.length} of {total} records · Page {page} of {pages}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn-ghost" disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
              <button className="btn-ghost" disabled={page >= pages}
                onClick={() => setPage(p => Math.min(pages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// A keyed wrapper so one log can render two <tr> rows (the row + its details row).
function FragmentRows({ children }) {
  return <>{children}</>
}
