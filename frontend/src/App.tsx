import { Routes, Route, Navigate } from "react-router-dom"
import { LandingPage } from "@/Pages/LandingPage"
import { LoginPage } from "@/Pages/LoginPage"
import { RegisterPage } from "@/Pages/RegisterPage"
import { ResetPasswordPage } from "@/Pages/ResetPasswordPage"
import { UserDashboard } from "@/Pages/UserDashboard"
import { useAuth } from "@/context/AuthProvider"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
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
    </Routes>
  )
}

export default App
