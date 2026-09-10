import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import SplashScreen from './components/branding/SplashScreen'
import Landing from './pages/Landing'
import PatientHome from './pages/PatientHome'
import FamilyPage from './pages/FamilyPage'
import Capsule from './pages/Capsule'
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
import { TranslationProvider, useTranslation } from './hooks/useTranslation'
import { DemoModeProvider, useDemoMode } from './hooks/useDemoMode'
import { useGenderTheme } from './hooks/useGenderTheme'
import { useElderMode } from './hooks/useElderMode'
import { useDemoData } from './hooks/useDemoData'
import { useReminderNotifications } from './hooks/useReminderNotifications'
import { useLocation, useNavigate } from 'react-router-dom'
import PageTransition from './components/ui/PageTransition'
import GenderThemeApplier from './components/ui/GenderThemeApplier'
import { Home, Phone } from 'lucide-react'
import { playTapSound } from './utils/audio'
import InstallExperience from './components/pwa/InstallExperience'
import DemoBadge from './components/demo/DemoBadge'
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

function CaregiverGate({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'caregiver') return <Navigate to="/" replace />
  return <>{children}</>
}

function SOSButton() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const number = user?.emergencyPhone?.replace(/[^0-9+]/g, '')
  const target = number && number.length >= 7 ? number : '112'
  const handleClick = () => {
    playTapSound()
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 200, 100, 200])
    window.open(`tel:${target}`, '_self')
  }
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-28 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg"
      aria-label={t('Call for help')}
      title={t('Call for help')}
    >
      <Phone size={20} style={{ color: '#ef4444' }} />
    </button>
  )
}

function AuthenticatedLayout({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const isGamesPage = location.pathname.startsWith('/games')
  const showChrome = location.pathname !== '/login' && location.pathname !== '/assessment'
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen bg-transparent">
      {!hideNav && <Navbar />}
      <main>
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>
      <InstallExperience />
      {!isHome && <AssistantButton />}
      {/* Petals belong to the garden rooms — the listen room and archive carry their own atmosphere */}
      {!isGamesPage && !isHome && location.pathname !== '/assistant' && location.pathname !== '/capsule' && <AmbientBackground />}
      {!isHome && (
        <button
          onClick={() => { playTapSound(); navigate('/') }}
          className="fixed bottom-6 left-6 z-50 w-10 h-10 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
          style={{
            background: '#F8F5EE',
            border: '1.5px solid rgba(23,23,23,0.6)',
            boxShadow: '0 4px 14px -4px rgba(23,23,23,0.25)',
          }}
          aria-label={t('Go Home')}
        >
          <Home size={18} style={{ color: '#171717' }} />
        </button>
      )}
      <SOSButton />
      {isHome && (
        <div className="fixed bottom-6 left-6 z-40 flex items-center gap-2 text-xs text-ink/60 dark:text-white/50 bg-ivory/90 dark:bg-white/5 backdrop-blur-sm rounded-full px-3 py-1.5 border border-ink/25 dark:border-white/10">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-leaf animate-pulse" />
          {t("You're home")}
        </div>
      )}
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()
  useGenderTheme()
  useElderMode()
  useDemoData()
  useReminderNotifications()

  return (
    <>
      <GenderThemeApplier />
      <CustomCursor />
      <DemoBadge />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <PageTransition><Login /></PageTransition>} />
        {/* Cinematic scroll story — the front door of AURA */}
        <Route path="/welcome" element={<Landing />} />
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
        <Route path="/games/memory-lane" element={
          <AssessmentGate>
            <AuthenticatedLayout><Games /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/capsule" element={
          <AssessmentGate>
            <AuthenticatedLayout><Capsule /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/assistant" element={
          <AssessmentGate>
            <AuthenticatedLayout><Assistant /></AuthenticatedLayout>
          </AssessmentGate>
        } />
        <Route path="/caregiver" element={
          <AssessmentGate>
            <CaregiverGate>
              <AuthenticatedLayout><Caregiver /></AuthenticatedLayout>
            </CaregiverGate>
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
    <>
      <SplashScreen onDone={() => {}} />
      <AuthProvider>
        <TranslationProvider>
          <DemoModeProvider>
            <AppRoutes />
          </DemoModeProvider>
        </TranslationProvider>
      </AuthProvider>
    </>
  )
}
