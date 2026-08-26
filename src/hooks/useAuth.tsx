import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface User {
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface StoredUser extends User {
  passwordHash: string
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('aura-users', [])
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('aura-current-user', null)

  const signup = (name: string, email: string, password: string) => {
    const exists = users.find(u => u.email === email.toLowerCase())
    if (exists) return { success: false, error: 'An account with this email already exists.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

    const newUser: StoredUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash: btoa(password),
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUser({ name: name.trim(), email: email.toLowerCase() })
    return { success: true }
  }

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email.toLowerCase())
    if (!user) return { success: false, error: 'No account found with this email.' }
    if (user.passwordHash !== btoa(password)) return { success: false, error: 'Incorrect password.' }
    setCurrentUser({ name: user.name, email: user.email })
    return { success: true }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
