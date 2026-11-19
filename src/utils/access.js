// Where each screen lives and which permission opens it.
// Used by the route guards (App.jsx), the sidebar and the mobile nav so they
// always agree. The server enforces the same rules on every API call.
export const ROUTE_PERMISSIONS = {
  '/dashboard':      ['dashboard.view'],
  '/members':        ['members.view'],
  '/visitors':       ['visitors.view'],
  '/attendance':     ['attendance.view'],
  '/finance':        ['finance.view'],
  '/pledges':        ['finance.view'],
  '/communications': ['communications.manage', 'communications.cell'],
  '/departments':    ['departments.view'],
  '/events':         ['events.view'],
  '/reports':        ['reports.view', 'reports.finance', 'reports.cell'],
  '/audit':          ['audit.view'],
  '/automations':    ['automations.manage'],
  '/settings':       ['settings.view'],
  '/billing':        ['billing.manage'],
}

// First screen a user is allowed to open (their "home").
export const homePathFor = (can) => {
  for (const path of ['/dashboard', '/attendance', '/members', '/finance', '/settings']) {
    if (can(...ROUTE_PERMISSIONS[path])) return path
  }
  return '/no-access'
}
