import { Users } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Users,
  title = 'No data found',
  message = 'Nothing to display here yet.',
  action
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} color="var(--text-muted)" />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {action && (
        <button className="btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}