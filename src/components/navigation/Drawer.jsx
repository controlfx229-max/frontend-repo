import Sidebar from './Sidebar'

export default function Drawer({ open, onClose }) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className={`drawer ${open ? 'open' : ''}`}>
        <Sidebar onClose={onClose} />
      </div>
    </>
  )
}