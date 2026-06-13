import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  open, onClose, onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false
}) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm animate-slideUp" onClick={e => e.stopPropagation()}>
        <div className="confirm-modal-body">
          <div className="confirm-modal-icon">
            <AlertTriangle size={24} color="var(--warning)" />
          </div>
          <h3 className="confirm-modal-title">{title}</h3>
          <p className="confirm-modal-message">{message}</p>
          <div className="confirm-modal-actions">
            <button className="btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn-danger" onClick={onConfirm} disabled={loading}>
              {loading ? 'Deleting...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}