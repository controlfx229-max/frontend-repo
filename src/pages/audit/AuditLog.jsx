import { useCallback, useEffect, useState } from 'react'
import useApi from '../../hooks/useApi'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AuditLog() {
  const { api, branchReady } = useApi()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 25

  const fetchLogs = useCallback(async () => {
    if (!branchReady) return

    setLoading(true)
    setError('')

    try {
      const data = await api(`/audit?page=${page}&limit=${limit}`)
      if (!data.success) {
        setError(data.message || 'Unable to load audit logs.')
        setLogs([])
        return
      }

      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError('Unable to load audit logs.')
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [api, branchReady, page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const pages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="members-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log</h1>
          <p className="page-subtitle">Track who performed key actions across your church system.</p>
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
                  <th>Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: 'var(--space-5)' }}>
                      No audit records found.
                    </td>
                  </tr>
                ) : logs.map((log) => (
                  <tr className="member-row" key={log._id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.userName || (log.userId?.name || 'Unknown')}</td>
                    <td>{log.action}</td>
                    <td>{log.resourceType}{log.resourceId ? ` (${log.resourceId.slice(0, 8)})` : ''}</td>
                    <td>{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
 
          {/* Mobile-friendly list (visible on small screens) */}
          <div className="audit-cards-list">
            {logs.length === 0 ? (
              <div style={{ padding: 'var(--space-5)' }}>No audit records found.</div>
            ) : (
              logs.map((log) => (
                <div className="audit-card" key={log._id}>
                  <div className="audit-card-row">
                    <div className="audit-time">{new Date(log.createdAt).toLocaleString()}</div>
                    <div className="audit-user">{log.userName || (log.userId?.name || 'Unknown')}</div>
                  </div>
                  <div className="audit-action-row">
                    <div className="audit-action">{log.action}</div>
                    <div className="audit-resource">{log.resourceType}{log.resourceId ? ` (${log.resourceId.slice(0, 8)})` : ''}</div>
                  </div>
                  <div className="audit-desc">{log.description}</div>
                </div>
              ))
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              Showing {logs.length} of {total} records
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                className="btn-ghost"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </button>
              <button
                className="btn-ghost"
                disabled={page >= pages}
                onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
