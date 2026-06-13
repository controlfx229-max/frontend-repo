import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBranch } from '../context/BranchContext'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

/**
 * Global API hook — automatically attaches auth token and active branch header.
 * All module pages should use this instead of raw fetch().
 */
export function useApi() {
  const { apiFetch } = useAuth()
  const { branchHeader, branchReady } = useBranch()

  const api = useCallback(async (path, options = {}) => {
    if (!branchReady) {
      throw new Error('Branch selection is not ready yet. Please wait a moment and try again.')
    }

    const url = path.startsWith('http')
      ? path
      : `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

    const res = await apiFetch(url, {
      ...options,
      headers: {
        'X-Branch-Id': branchHeader,
        ...(options.headers || {})
      }
    })

    return res.json()
  }, [apiFetch, branchHeader, branchReady])

  return { api, branchHeader, branchReady }
}

export default useApi
