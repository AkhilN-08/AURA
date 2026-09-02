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
export type UserRole = 'patient' | 'caregiver'

interface User {
  email: string
  name: string
  gender?: Gender
  role?: UserRole
  assessmentCompleted?: boolean
  assessmentResult?: AssessmentResult
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  signup: (name: string, email: string, password: string, gender?: Gender, pin?: string, role?: UserRole, caregiverPin?: string) => { success: boolean; error?: string }
  pinLogin: (pin: string) => { success: boolean; error?: string }
  setPin: (pin: string) => { success: boolean; error?: string }
  hasPin: boolean
  logout: () => void
  setGender: (gender: Gender) => void
  setRole: (role: UserRole) => void
  validateCaregiverPin: (pin: string) => boolean
  completeAssessment: (result: AssessmentResult) => void
  retakeAssessment: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

interface StoredUser {
  email: string
  name: string
  gender?: Gender
  role?: UserRole
  passwordHash: string
  pin?: string
  caregiverPin?: string
  assessmentCompleted?: boolean
  assessmentResult?: AssessmentResult
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('aura-users', [])
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('aura-current-user', null)

  const signup = (name: string, email: string, password: string, gender?: Gender, pin?: string, role?: UserRole, caregiverPin?: string) => {
    const exists = users.find(u => u.email === email.toLowerCase())
    if (exists) return { success: false, error: 'An account with this email already exists.' }

    const userRole: UserRole = role || 'patient'
    const newUser: StoredUser = {
      name: name.trim(),
      email: email.toLowerCase(),
      gender,
      role: userRole,
      passwordHash: btoa(password),
      pin,
      caregiverPin: caregiverPin || undefined,
    }
    setUsers(prev => [...prev, newUser])
    setCurrentUser({ name: name.trim(), email: email.toLowerCase(), gender, role: userRole })
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
      role: user.role,
      assessmentCompleted: user.assessmentCompleted,
      assessmentResult: user.assessmentResult,
    })
    return { success: true }
  }

  const pinLogin = (pin: string) => {
    const user = users.find(u => u.pin === pin)
    if (!user) return { success: false, error: 'Incorrect PIN.' }
    setCurrentUser({
      name: user.name,
      email: user.email,
      gender: user.gender,
      role: user.role,
      assessmentCompleted: user.assessmentCompleted,
      assessmentResult: user.assessmentResult,
    })
    return { success: true }
  }

  const setPin = (pin: string) => {
    if (!currentUser) return { success: false, error: 'Not logged in.' }
    if (!/^\d{4}$/.test(pin)) return { success: false, error: 'PIN must be 4 digits.' }
    setUsers(prev =>
      prev.map(u =>
        u.email === currentUser.email ? { ...u, pin } : u
      )
    )
    return { success: true }
  }

  const hasPin = users.some(u => u.pin && currentUser?.email === u.email)

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

  const setGender = (gender: Gender) => {
    if (!currentUser) return
    const updatedUser = { ...currentUser, gender }
    setCurrentUser(updatedUser)
    setUsers(prev =>
      prev.map(u =>
        u.email === currentUser.email ? { ...u, gender } : u
      )
    )
  }

  const setRole = (role: UserRole) => {
    if (!currentUser) return
    const updatedUser = { ...currentUser, role }
    setCurrentUser(updatedUser)
    setUsers(prev =>
      prev.map(u =>
        u.email === currentUser.email ? { ...u, role } : u
      )
    )
  }

  const validateCaregiverPin = (pin: string): boolean => {
    if (!currentUser) return false
    const stored = users.find(u => u.email === currentUser.email)
    return !!stored && stored.caregiverPin === pin
  }

  return (
    <AuthContext.Provider value={{ user: currentUser, login, signup, pinLogin, setPin, hasPin, logout, setGender, setRole, validateCaregiverPin, completeAssessment, retakeAssessment }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
