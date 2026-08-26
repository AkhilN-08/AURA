import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import Games from './pages/Games'
import Assistant from './pages/Assistant'
import Caregiver from './pages/Caregiver'
import Login from './pages/Login'
import Navbar from './components/navigation/Navbar'
import AssistantButton from './components/assistant/AssistantButton'
import CustomCursor from './components/ui/CustomCursor'
import AmbientBackground from './components/ui/AmbientBackground'
import type { ReactNode } from 'react'

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <CustomCursor />
      <AmbientBackground />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Landing /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/games" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Games /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/games/memory" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Games /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/games/objects" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Games /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/games/sequence" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Games /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/assistant" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Assistant /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/caregiver" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-transparent">
              <Navbar />
              <main><Caregiver /></main>
              <AssistantButton />
            </div>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
