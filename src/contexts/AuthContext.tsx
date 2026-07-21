import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { getMe, login as loginRequest } from '../api/crm'
import { tokenStorage } from '../utils/storage'

type User = { id: string; nome: string; email: string; papel: 'ADMIN' | 'VENDEDOR' }

type AuthContextValue = {
  user: User | null
  loading: boolean
  signIn: (email: string, senha: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      if (!tokenStorage.get()) {
        setLoading(false)
        return
      }
      try {
        const response = await getMe()
        setUser(response.usuario ?? response)
      } catch {
        tokenStorage.clear()
      } finally {
        setLoading(false)
      }
    }
    void bootstrap()
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    signIn: async (email, senha) => {
      const response = await loginRequest(email, senha)
      tokenStorage.set(response.token)
      const me = response.usuario ?? (await getMe()).usuario ?? (await getMe())
      setUser(me)
    },
    signOut: () => {
      tokenStorage.clear()
      setUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return context
}
