import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Landing from './pages/Landing'
import PatientHome from './pages/PatientHome'
import FamilyPage from './pages/FamilyPage'
import Games from './pages/Games'
import Assistant from './pages/Assistant'
import Caregiver from './pages/Caregiver'
import About from './pages/About'
import Login from './pages/Login'
import Assessment from './pages/Assessment'
import Navbar from './components/navigation/Navbar'
import AssistantButton from './components/assistant/AssistantButton'
import CustomCursor from './components/ui/CustomCursor'
import AmbientBackground from './components/ui/AmbientBackground'
import { TranslationProvider } from './hooks/useTranslation'
import { useGenderTheme } from './hooks/useGenderTheme'
import { useDemoData } from './hooks/useDemoData'
import { useReminderNotifications } from './hooks/useReminderNotifications'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTransition from './components/ui/PageTransition'
import GenderThemeApplier from './components/ui/GenderThemeApplier'
import { Home } from 'lucide-react'
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

function AuthenticatedLayout({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const location = useLocation()
  const isGamesPage = location.pathname.startsWith('/games')

  return (
    <div className="min-h-screen bg-transparent">
      {!hideNav && <Navbar />}
      <main>
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>
      {location.pathname !== '/' && <AssistantButton />}
      {!isGamesPage && location.pathname !== '/' && <AmbientBackground />}
      {location.pathname !== '/' && location.pathname !== '/login' && location.pathname !== '/assessment' && (
        <button
          onClick={() => window.location.assign('/')}
          className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-sage-400 to-sage-600 text-white shadow-[0_4px_20px_rgba(244,114,182,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300"
          aria-label="Go Home"
        >
          <Home size={24} />
        </button>
      )}
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  useGenderTheme()
  useDemoData()
  useReminderNotifications()

  return (
    <>
      <GenderThemeApplier />
      <CustomCursor />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <PageTransition><Login /></PageTransition>} />
        <Route path="/assessment" element={
          <ProtectedRoute>
            <PageTransition><Assessment /></PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <AssessmentGate>
            <AuthenticatedLayout><PatientHome /></AuthenticatedLayout>
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
        <Route path="/about" element={
          <AssessmentGate>
            <AuthenticatedLayout><About /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/family" element={
          <AssessmentGate>
            <AuthenticatedLayout><FamilyPage /></AuthenticatedLayout>
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
