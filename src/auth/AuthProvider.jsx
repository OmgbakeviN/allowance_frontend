import { createContext, useEffect, useMemo, useState } from "react"
import { fetchMe, loginRequest } from "@/auth/authService"
import { tokenStorage } from "@/auth/tokenStorage"
import { setUnauthorizedHandler } from "@/api/axios"

export const AuthContext = createContext(null)

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const logout = () => {
    tokenStorage.clear()
    setUser(null)
  }

  const init = async () => {
    const access = tokenStorage.getAccess()
    const refresh = tokenStorage.getRefresh()
    if (!access && !refresh) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await fetchMe()
      setUser(me)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ username, password }) => {
    await loginRequest({ username, password })
    const me = await fetchMe()
    setUser(me)
    return me
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
    init()
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}