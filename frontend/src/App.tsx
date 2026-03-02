import { Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "@/Pages/LandingPage"
import { LoginPage } from "@/Pages/LoginPage"
import { RegisterPage } from "@/Pages/RegisterPage"
import { ResetPasswordPage } from "@/Pages/ResetPasswordPage"
import { UserDashboard } from "@/Pages/UserDashboard"
import { HotelDetails } from "@/Pages/HotelDetails"
import { HotelOwnerLoginPage } from "@/Pages/HotelOwnerLoginPage"
import { HotelOwnerRegisterPage } from "@/Pages/HotelOwnerRegisterPage"
import { HotelOwnerOnboarding } from "@/Pages/HotelOwnerOnboarding"
import { HotelOwnerDashboard } from "@/Pages/HotelOwnerDashboard"
import { useAuth } from "@/context/AuthProvider"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function HotelOwnerRoute({ children }: { children: React.ReactNode }) {
  const ownerData = localStorage.getItem("hotelOwner")
  const isAuthenticated = ownerData && JSON.parse(ownerData).isAuthenticated
  
  if (!isAuthenticated) {
    return <Navigate to="/owner/login" replace />
  }
  
  const onboardingComplete = localStorage.getItem("onboardingComplete")
  if (onboardingComplete !== "true") {
    return <Navigate to="/owner/onboarding" replace />
  }
  
  return <>{children}</>
}

export function App() {
  return (
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
      
      {/* Hotel Owner Routes */}
      <Route path="/owner/login" element={<HotelOwnerLoginPage />} />
      <Route path="/owner/register" element={<HotelOwnerRegisterPage />} />
      <Route
        path="/owner/onboarding"
        element={
          <HotelOwnerOnboarding />
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
    </Routes>
  )
}

export default App
