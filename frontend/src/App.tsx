import { Routes, Route, Navigate } from "react-router-dom"
import { useEffect } from "react"
import { LandingPage } from "@/Pages/LandingPage"
import { LoginPage } from "@/Pages/LoginPage"
import { RegisterPage } from "@/Pages/RegisterPage"
import { ResetPasswordPage } from "@/Pages/ResetPasswordPage"
import { UserDashboard } from "@/Pages/UserDashboard"
import { HotelDetails } from "@/Pages/HotelDetails"
import { UserBookingsPage } from "@/Pages/UserBookingsPage"
import { PaymentPage } from "@/Pages/PaymentPage"
import { HotelOwnerLoginPage } from "@/Pages/HotelOwnerLoginPage"
import { HotelOwnerRegisterPage } from "@/Pages/HotelOwnerRegisterPage"
import { HotelOwnerOnboarding } from "@/Pages/HotelOwnerOnboarding"
import { HotelOwnerDashboard } from "@/Pages/HotelOwnerDashboard"
import { HotelOwnerBookingsPage } from "@/Pages/HotelOwnerBookingsPage"
import { AdminLoginPage } from "@/Pages/AdminLoginPage"
import { AdminDashboard } from "@/Pages/AdminDashboard"
import { useAdminAuth } from "@/context/AdminAuthProvider"
import { useAuth } from "@/context/AuthProvider"
import { clearAllAuthState } from "@/lib/authAtoms"

// Storage event listener component to sync logout across tabs
function StorageEventListener() {
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Listen for auth-related storage changes from other tabs
      if (['token', 'user', 'hotelOwnerToken', 'hotelOwner', 'adminToken', 'admin'].includes(e.key || '')) {
        // If storage was cleared in another tab, clear in this tab too
        if (!e.newValue) {
          clearAllAuthState(() => {})
        }
      }
    }

    const handleCustomLogout = () => {
      // Listen for custom logout events from same tab
      clearAllAuthState(() => {})
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-logout', handleCustomLogout)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-logout', handleCustomLogout)
    }
  }, [])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/admin/login" replace />
}

function HotelOwnerRoute({ children }: { children: React.ReactNode }) {
  const ownerData = localStorage.getItem("hotelOwner")
  const isAuthenticated = ownerData && JSON.parse(ownerData).isAuthenticated
  const onboardingComplete = ownerData && JSON.parse(ownerData).onboardingComplete

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />
  }

  if (!onboardingComplete) {
    return <Navigate to="/owner/onboarding" replace />
  }

  return <>{children}</>
}

function OnboardingRoute({ children }: { children: React.ReactNode }) {
  const ownerData = localStorage.getItem("hotelOwner")
  const isAuthenticated = ownerData && JSON.parse(ownerData).isAuthenticated
  const onboardingComplete = ownerData && JSON.parse(ownerData).onboardingComplete

  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />
  }

  if (onboardingComplete) {
    return <Navigate to="/owner/dashboard" replace />
  }

  return <>{children}</>
}

export function App() {
  return (
    <>
      <StorageEventListener />
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hotel/:id"
        element={
          <ProtectedRoute>
            <HotelDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <UserBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />

      {/* Hotel Owner Routes */}
      <Route path="/owner/login" element={<HotelOwnerLoginPage />} />
      <Route path="/owner/register" element={<HotelOwnerRegisterPage />} />
      <Route
        path="/owner/onboarding"
        element={
          <OnboardingRoute>
            <HotelOwnerOnboarding />
          </OnboardingRoute>
        }
      />
      <Route
        path="/owner/dashboard"
        element={
          <HotelOwnerRoute>
            <HotelOwnerDashboard />
          </HotelOwnerRoute>
        }
      />
      <Route
        path="/owner/bookings"
        element={
          <HotelOwnerRoute>
            <HotelOwnerBookingsPage />
          </HotelOwnerRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>
        }
      />
    </Routes>
    </>
  )
}

export default App
