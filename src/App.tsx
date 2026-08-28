import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Games from './pages/Games'
import Assistant from './pages/Assistant'
import Caregiver from './pages/Caregiver'
import Login from './pages/Login'
import Assessment from './pages/Assessment'
import Navbar from './components/navigation/Navbar'
import AssistantButton from './components/assistant/AssistantButton'
import CustomCursor from './components/ui/CustomCursor'
import AmbientBackground from './components/ui/AmbientBackground'
import AccessibilityToggle from './components/ui/AccessibilityToggle'
import { TranslationProvider } from './hooks/useTranslation'
import { useGenderTheme } from './hooks/useGenderTheme'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AssessmentGate({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!user.assessmentCompleted) return <Navigate to="/assessment" replace />
  return <>{children}</>
}

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isGamesPage = location.pathname.startsWith('/games')

  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main>{children}</main>
      <AssistantButton />
      <AccessibilityToggle />
      {!isGamesPage && <AmbientBackground />}
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  useGenderTheme()

  return (
    <>
      <CustomCursor />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/assessment" element={
          <ProtectedRoute>
            <Assessment />
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <AssessmentGate>
            <AuthenticatedLayout><Landing /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/games" element={
          <AssessmentGate>
            <AuthenticatedLayout><Games /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/games/memory" element={
          <AssessmentGate>
            <AuthenticatedLayout><Games /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/games/objects" element={
          <AssessmentGate>
            <AuthenticatedLayout><Games /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/games/sequence" element={
          <AssessmentGate>
            <AuthenticatedLayout><Games /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/assistant" element={
          <AssessmentGate>
            <AuthenticatedLayout><Assistant /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/caregiver" element={
          <AssessmentGate>
            <AuthenticatedLayout><Caregiver /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <TranslationProvider>
        <AppRoutes />
      </TranslationProvider>
    </AuthProvider>
  )
}
