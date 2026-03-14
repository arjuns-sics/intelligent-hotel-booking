import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Shield, Mail, Lock, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useAdminAuth } from "@/context/AdminAuthProvider"

export function AdminLoginPage() {
    const navigate = useNavigate()
    const { login } = useAdminAuth()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!email || !password) {
            setError("Please enter both email and password")
            return
        }

        setLoading(true)

        try {
            const result = await login(email, password)

            if (result.success) {
                navigate("/admin/dashboard")
            } else {
                setError(result.error || "Login failed")
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An error occurred during login"
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Admin Portal</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Not an admin?</span>
                        <Button variant="outline" asChild>
                            <Link to="/login">User Login</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-24">
                <div className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Admin Access</CardTitle>
                            <CardDescription>
                                Enter your credentials to access the admin panel
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="admin@hotel.com"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                                disabled={loading}
                                            />
                                        </div>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password">Password</FieldLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10"
                                                disabled={loading}
                                            />
                                        </div>
                                    </Field>
                                    {error && (
                                        <div className="text-sm text-red-500 mt-2">
                                            {error}
                                        </div>
                                    )}
                                    <Field>
                                        <Button type="submit" className="w-full" disabled={loading}>
                                            {loading ? "Signing In..." : "Sign In"}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>

                                        <FieldDescription className="text-center mt-4">
                                            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                                <strong>Demo Credentials:</strong><br />
                                                Email: admin@hotel.com<br />
                                                Password: admin123
                                            </div>
                                        </FieldDescription>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default AdminLoginPage
