import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API = import.meta.env.VITE_API_URL

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Clear everything and redirect, with optional message ─
  // The message (e.g. "Account suspended") is stashed in localStorage
  // so the Login page can read and display it after the redirect.
  const logout = useCallback((message) => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    if (message) localStorage.setItem('logoutMessage', message)
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  // ── Load saved session + refresh user from DB ─
  // Two-step: restore from localStorage immediately (no flash),
  // then silently fetch fresh user from DB to pick up any changes
  // made by superadmin (crossBranchReadOnly, role changes, deactivation,
  // or org suspension) without forcing the user to log out and back in
  // for legitimate updates — but DOES force logout if suspended.
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser  = localStorage.getItem('user')

    if (!savedToken || !savedUser) {
      setLoading(false)
      return
    }

    // Step 1: restore immediately so the UI doesn't flash logged-out
    setToken(savedToken)
    setUser(JSON.parse(savedUser))

    // Step 2: fetch fresh user from DB in the background
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${savedToken}` }
    })
    .then(async r => {
      const data = await r.json().catch(() => null)

      // ── Suspended org — force logout immediately ──
      if (r.status === 403 && data?.code === 'ACCOUNT_SUSPENDED') {
        logout(typeof data.message === 'string' ? data.message : 'You have been logged out.')
        return
      }

      if (data?.success && data.user) {
        // DB is authoritative — overwrite stale fields while keeping
        // any client-side-only fields that getMe doesn't return
        const freshUser = {
          ...JSON.parse(savedUser),
          ...data.user
        }
        localStorage.setItem('user', JSON.stringify(freshUser))
        setUser(freshUser)
      }
    })
    .catch(() => null) // silent fail — stale session still works
    .finally(() => setLoading(false))
  }, [logout])

  // ── Save login ────────────────────────────────
  const login = (tokenValue, userData) => {
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
    setToken(tokenValue)
    setUser(userData)
  }

  // ── Refresh access token silently ─────────────
  const refreshAccessToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem('refreshToken')
    if (!storedRefresh) { logout(); return null }

    try {
      const res  = await fetch(`${API}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken: storedRefresh })
      })
      const data = await res.json()

      if (!data.success) { logout(); return null }

      localStorage.setItem('token', data.token)
      localStorage.setItem('refreshToken', data.refreshToken)
      setToken(data.token)
      return data.token
    } catch {
      logout()
      return null
    }
  }, [logout])

  // ── apiFetch: wraps every API call ────────────
  // Automatically retries once with a fresh token on 401,
  // and force-logs-out immediately on ACCOUNT_SUSPENDED (403).
  const apiFetch = useCallback(async (url, options = {}) => {
    const currentToken = localStorage.getItem('token')

    const makeRequest = (tkn) => fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        Authorization: `Bearer ${tkn}`
      }
    })

    let res = await makeRequest(currentToken)

    if (res.status === 401) {
      const newToken = await refreshAccessToken()
      if (!newToken) return res
      res = await makeRequest(newToken)
    }

    // ── Suspended org — kick out immediately, from any screen ──
    // Use res.clone() so the original response body is still
    // readable by the caller if this ISN'T a suspension.
    if (res.status === 403) {
      const data = await res.clone().json().catch(() => null)
      if (data?.code === 'ACCOUNT_SUSPENDED') {
        logout(typeof data.message === 'string' ? data.message : 'You have been logged out.')
        return res
      }
    }

    return res
  }, [refreshAccessToken, logout])

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, logout,
      apiFetch
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)