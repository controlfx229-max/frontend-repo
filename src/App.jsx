import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'
import { BranchProvider } from './context/BranchContext'
import './styles/global.css'
import './styles/pages.css'
import './styles/layout.css'

// Layouts
import AppLayout from './layouts/AppLayout'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Church app pages
import Dashboard      from './pages/dashboard/Dashboard'
import Members        from './pages/members/Members'
import MemberProfile  from './pages/members/MemberProfile'
import Attendance     from './pages/attendance/Attendance'
import Finance        from './pages/finance/Finance'
import Communications from './pages/communications/Communications'
import Departments    from './pages/departments/Departments'
import Events         from './pages/events/Events'
import Reports        from './pages/reports/Reports'
import Settings       from './pages/settings/Settings'
import Visitors       from './pages/visitors/Visitors'
import Pledges        from './pages/pledges/Pledges'
import Automations    from './pages/automations/Automations'
import TwoFactorSetup    from './pages/auth/TwoFactorSetup'
import TwoFactorVerify   from './pages/auth/TwoFactorVerify'
import BackupCodeVerify  from './pages/auth/BackupCodeVerify'


// Billing & Platform Admin
import Billing       from './pages/billing/Billing'
import PlatformAdmin from './pages/admin/PlatformAdmin'
import AuditLog       from './pages/audit/AuditLog'

// ─────────────────────────────────────────────
// Subscription statuses that allow full access
// ─────────────────────────────────────────────
const FULL_ACCESS_STATUSES = ['trial', 'active']

// ─────────────────────────────────────────────
// LOADING SPINNER
// ─────────────────────────────────────────────
function AppLoading() {
  return (
    <div className="app-loading">
      <div className="app-loading-spinner" />
    </div>
  )
}

// ─────────────────────────────────────────────
// GUARD: Requires authentication
// Unauthenticated → /login
// ─────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, token, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AppLoading />

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

// ─────────────────────────────────────────────
// GUARD: Platform owner only
// Anyone else trying /admin-platform → /dashboard
// ─────────────────────────────────────────────
function RequirePlatformOwner({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <AppLoading />

  if (user?.role !== 'PLATFORM_OWNER') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ─────────────────────────────────────────────
// GUARD: Block platform owner from church pages
// Platform owner → /admin-platform
// ─────────────────────────────────────────────
function BlockPlatformOwner({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <AppLoading />

  if (user?.role === 'PLATFORM_OWNER') {
    return <Navigate to="/admin-platform" replace />
  }

  return children
}

// ─────────────────────────────────────────────
// GUARD: Subscription check
// Expired/suspended/pending → /billing only
// trial or active → full access
// undefined/null status → allow through (safety)
// ─────────────────────────────────────────────
function RequireSubscription({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <AppLoading />

  // Platform owner is never subscription-gated
  if (user?.role === 'PLATFORM_OWNER') return children

  const status = user?.subscriptionStatus

  // If status is missing, allow through — backend enforces anyway
  if (!status) return children

  // Active trial or paid plan → full access
  if (FULL_ACCESS_STATUSES.includes(status)) return children

  // Expired, suspended, pending → billing only
  if (location.pathname !== '/billing') {
    return <Navigate to="/billing" replace />
  }

  return children
}

// ─────────────────────────────────────────────
// SMART REDIRECT
// Sends logged-in users to the right place
// based on role and subscription status
// ─────────────────────────────────────────────
function SmartRedirect() {
  const { user, token, loading } = useAuth()

  if (loading) return <AppLoading />

  if (!token || !user) return <Navigate to="/login" replace />

  if (user.role === 'PLATFORM_OWNER') {
    return <Navigate to="/admin-platform" replace />
  }

  const status = user?.subscriptionStatus

  // Only redirect to billing if status is explicitly non-active
  if (status && !FULL_ACCESS_STATUSES.includes(status)) {
    return <Navigate to="/billing" replace />
  }

  return <Navigate to="/dashboard" replace />
}

// ─────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>

      {/* ── PUBLIC ────────────────────────────── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password"  element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/2fa-setup"   element={<TwoFactorSetup />} />
      <Route path="/2fa-verify"  element={<TwoFactorVerify />} />
      <Route path="/2fa-backup"  element={<BackupCodeVerify />} />



      {/* ── PLATFORM OWNER ────────────────────── */}
      {/* Standalone — no BranchProvider, no church layout */}
      <Route
        path="/admin-platform"
        element={
          <RequireAuth>
            <RequirePlatformOwner>
              <PlatformAdmin />
            </RequirePlatformOwner>
          </RequireAuth>
        }
      />

      {/* ── BILLING ───────────────────────────── */}
      {/* Accessible at any subscription status.
          BranchProvider only wraps church users here. */}
      <Route
        element={
          <RequireAuth>
            <BlockPlatformOwner>
              <BranchProvider>
                <AppLayout />
              </BranchProvider>
            </BlockPlatformOwner>
          </RequireAuth>
        }
      >
        <Route path="/billing" element={<Billing />} />
      </Route>

      {/* ── CHURCH APP ────────────────────────── */}
      {/* Requires active subscription.
          BranchProvider only wraps church users here. */}
      <Route
        element={
          <RequireAuth>
            <BlockPlatformOwner>
              <RequireSubscription>
                <BranchProvider>
                  <AppLayout />
                </BranchProvider>
              </RequireSubscription>
            </BlockPlatformOwner>
          </RequireAuth>
        }
      >
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/members"        element={<Members />} />
        <Route path="/members/:id"    element={<MemberProfile />} />
        <Route path="/attendance"     element={<Attendance />} />
        <Route path="/finance"        element={<Finance />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/departments"    element={<Departments />} />
        <Route path="/events"         element={<Events />} />
        <Route path="/reports"        element={<Reports />} />
        <Route path="/audit"          element={<AuditLog />} />
        <Route path="/settings"       element={<Settings />} />
        <Route path="/visitors"       element={<Visitors />} />
        <Route path="/pledges"        element={<Pledges />} />
        <Route path="/automations"    element={<Automations />} />
      </Route>

      {/* ── CATCH-ALL ─────────────────────────── */}
      <Route path="*" element={<SmartRedirect />} />

    </Routes>
  )
}

// ─────────────────────────────────────────────
// ROOT
// BranchProvider is NOT here — it's only inside
// church routes so Platform Owner never hits it
// ─────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App