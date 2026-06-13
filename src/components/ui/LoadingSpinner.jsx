export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      {message && <p className="spinner-message">{message}</p>}
    </div>
  )
}