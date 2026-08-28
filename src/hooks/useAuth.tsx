import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export interface AssessmentResult {
  memoryScore: number
  sequenceScore: number
  focusScore: number
  wordScore: number
  reactionTime: number
  overallScore: number
  level: 'mild' | 'moderate' | 'significant'
  recommendedGames: string[]
  completedAt: string
}

export type Gender = 'male' | 'female' | null

interface User {
  email: string
  name: string
  gender?: Gender
  assessmentCompleted?: boolean
  assessmentResult?: AssessmentResult
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string, gender?: Gender) => { success: boolean; error?: string }
  logout: () => void
  completeAssessment: (result: AssessmentResult) => void
  retakeAssessment: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface StoredUser {
  email: string
  name: string
  gender?: Gender
  passwordHash: string
  assessmentCompleted?: boolean
  assessmentResult?: AssessmentResult
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('aura-users', [])
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('aura-current-user', null)

  const signup = (name: string, email: string, password: string, gender?: Gender) => {
    const exists = users.find(u => u.email === email.toLowerCase())
    if (exists) return { success: false, error: 'An account with this email already exists.' }
    if (password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' }

    const newUser: StoredUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      gender,
      passwordHash: btoa(password),
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUser({ name: name.trim(), email: email.toLowerCase(), gender })
    return { success: true }
  }

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email.toLowerCase())
    if (!user) return { success: false, error: 'No account found with this email.' }
    if (user.passwordHash !== btoa(password)) return { success: false, error: 'Incorrect password.' }
    setCurrentUser({
      name: user.name,
      email: user.email,
      gender: user.gender,
      assessmentCompleted: user.assessmentCompleted,
      assessmentResult: user.assessmentResult,
    })
    return { success: true }
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const completeAssessment = (result: AssessmentResult) => {
    if (!currentUser) return
    const updatedUser = {
      ...currentUser,
      assessmentCompleted: true,
      assessmentResult: result,
    }
    setCurrentUser(updatedUser)
    // Also update in users list
    setUsers(prev =>
      prev.map(u =>
        u.email === currentUser.email
          ? { ...u, assessmentCompleted: true, assessmentResult: result }
          : u
      )
    )
  }

  const retakeAssessment = () => {
    if (!currentUser) return
    const updatedUser = {
      ...currentUser,
      assessmentCompleted: false,
      assessmentResult: undefined,
    }
    setCurrentUser(updatedUser)
    setUsers(prev =>
      prev.map(u =>
        u.email === currentUser.email
          ? { ...u, assessmentCompleted: false, assessmentResult: undefined }
          : u
      )
    )
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, login, signup, logout, completeAssessment, retakeAssessment }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
