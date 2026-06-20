import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/auth'
import { setAuthToken, clearAuthToken } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      setAuthToken(token)
      authAPI.getProfile()
        .then(res => setUser(res.data.data))
        .catch(() => { clearTokens(); clearAuthToken() })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const login = useCallback(async (username, password) => {
    const res = await authAPI.login({ username, password })
    const { tokens, user: userData } = res.data.data
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setAuthToken(tokens.access)
    setUser(userData)
    return userData
  }, [])

  const register = useCallback(async (data) => {
    const res = await authAPI.register(data)
    const { tokens, user: userData } = res.data.data
    localStorage.setItem('access_token',  tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setAuthToken(tokens.access)
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    const refresh = localStorage.getItem('refresh_token')
    try { await authAPI.logout({ refresh }) } catch (_) {}
    clearTokens()
    clearAuthToken()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const res = await authAPI.getProfile()
    setUser(res.data.data)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
