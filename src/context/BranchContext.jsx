import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { API_BASE } from '../hooks/useApi'

const BranchContext = createContext(null)

export function BranchProvider({ children }) {
  const { user, token } = useAuth()
  const [branches,    setBranches]    = useState([])
  const [activeBranch, setActiveBranch] = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Superadmin: full branch switching, no restrictions
  const canSeeAllBranches = user?.role === 'superadmin'

  // Pastors/branch_admins with crossBranchReadOnly can VIEW (not write) other branches
  const canReadOtherBranches =
    ['pastor', 'branch_admin'].includes(user?.role) &&
    user?.crossBranchReadOnly === true

  // Either full access or read-only access = can use the branch switcher
  const canSwitchBranches = canSeeAllBranches || canReadOtherBranches

  const userBranchId = user?.branchId?._id || user?.branchId

  // ── FETCH BRANCHES ────────────────────────────
  const fetchBranches = useCallback(async () => {
    if (!token || !user) return
    if (user.role === 'PLATFORM_OWNER' || user.isPlatformOwner) return
    if (!user.organizationId) return

    setLoading(true)
    try {
      const res  = await fetch(`${API_BASE}/branches`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) setBranches(data.branches || [])
    } catch (err) {
      console.error('❌ Failed to fetch branches:', err)
    } finally {
      setLoading(false)
    }
  }, [token, user])

  useEffect(() => {
    if (!user || !token) return
    fetchBranches()
  }, [user, token, fetchBranches])

  // ── RESTORE / LOCK BRANCH SELECTION ──────────
  useEffect(() => {
    if (!user) {
      setInitialized(false)
      return
    }

    if (user.role === 'PLATFORM_OWNER' || user.isPlatformOwner) {
      setInitialized(true)
      return
    }

    if (loading) return

    // ── Roles with NO branch switching at all ──────────────────────────────
    // Strictly locked to their own assigned branch — no saved preference checked
    if (!canSwitchBranches) {
      const userBranch = branches.find(
        b => b._id === userBranchId || b._id?.toString() === userBranchId?.toString()
      )
      setActiveBranch(userBranch || branches[0] || null)
      setInitialized(true)
      return
    }

    if (branches.length === 0) {
      setInitialized(true)
      return
    }

    const userId = user?.id || user?._id
    const saved  = localStorage.getItem(`mos_branch_${userId}`)

    if (canSeeAllBranches) {
      // Superadmin: can select "all" or any branch
      if (saved === 'all') {
        setActiveBranch(null)
      } else if (saved) {
        const found = branches.find(b => b._id === saved)
        setActiveBranch(found || branches[0] || null)
      } else {
        setActiveBranch(branches[0] || null)
      }
    } else {
      // Pastor with crossBranchReadOnly: can switch branches but NOT "all"
      // Default to their own assigned branch if no saved preference
      const ownBranch = branches.find(
        b => b._id === userBranchId || b._id?.toString() === userBranchId?.toString()
      )
      if (saved && saved !== 'all') {
        const found = branches.find(b => b._id === saved)
        // Only restore if the saved branch is still valid in this org
        setActiveBranch(found || ownBranch || branches[0] || null)
      } else {
        // Default to their own branch
        setActiveBranch(ownBranch || branches[0] || null)
      }
    }

    setInitialized(true)
  }, [branches, canSwitchBranches, canSeeAllBranches, user, userBranchId, loading])

  const switchBranch = useCallback((branch) => {
    // Pastors with crossBranchReadOnly cannot select "all branches" —
    // they must always be scoped to a specific branch
    if (!canSeeAllBranches && branch === null) return

    setActiveBranch(branch)
    const userId = user?.id || user?._id
    const key    = `mos_branch_${userId}`
    localStorage.setItem(key, branch === null ? 'all' : branch._id)
  }, [canSeeAllBranches, user?.id, user?._id])

  const branchHeader = activeBranch
  ? activeBranch._id
  : canSeeAllBranches ? 'all' : (userBranchId?.toString() || 'all')
// That's the only change needed in this file. The rest of the logic is correct — the pastor initialization already defaults activeBranch to their own branch, but during the brief window before branches loads and the effect runs, act
  const branchReady  = initialized && !loading

  return (
    <BranchContext.Provider value={{
      branches,
      activeBranch,
      switchBranch,
      branchHeader,
      branchReady,
      canSeeAllBranches,
      canReadOtherBranches,  // expose so UI can show read-only indicators
      canSwitchBranches,     // expose so branch switcher UI knows whether to render
      loading,
      fetchBranches
    }}>
      {children}
    </BranchContext.Provider>
  )
}

export const useBranch = () => {
  const context = useContext(BranchContext)
  if (!context) {
    throw new Error('useBranch must be used inside <BranchProvider>')
  }
  return context
}