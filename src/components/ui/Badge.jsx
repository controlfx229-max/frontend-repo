// Reusable status badge component
export default function Badge({ status }) {
  const map = {
    active:      { label: 'Active',      class: 'badge-success' },
    inactive:    { label: 'Inactive',    class: 'badge-warning' },
    new_convert: { label: 'New Convert', class: 'badge-info'    },
    visitor:     { label: 'Visitor',     class: 'badge-neutral' },
    transferred: { label: 'Transferred', class: 'badge-danger'  },
  }

  const config = map[status] || { label: status, class: 'badge-neutral' }

  return (
    <span className={`badge ${config.class}`}>
      {config.label}
    </span>
  )
}