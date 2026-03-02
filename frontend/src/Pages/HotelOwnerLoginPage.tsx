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
import { Building2, Mail, Lock, ArrowRight, Hotel } from "lucide-react"
import { useState } from "react"

export function HotelOwnerLoginPage() {
    const navigate = useNavigate()

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

        // Mock authentication for hotel owners
        setTimeout(() => {
            // Store mock owner data
            localStorage.setItem("hotelOwner", JSON.stringify({
                id: "owner-1",
                email: email,
                name: "Rajesh Kumar",
                hotelName: "The Grand Palace Hotel",
                hotelId: "1",
                isAuthenticated: true
            }))
            
            // Check if onboarding is complete
            const onboardingComplete = localStorage.getItem("onboardingComplete")
            if (onboardingComplete === "true") {
                navigate("/owner/dashboard")
            } else {
                navigate("/owner/onboarding")
            }
            
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Intelligent Hotel</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Not a partner yet?</span>
                        <Button variant="outline" asChild>
                            <Link to="/owner/register">List Your Property</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-24">
                <div className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Hotel className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">Partner Login</CardTitle>
                                    <CardDescription>
                                        Manage your hotel property
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Business Email</FieldLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="owner@hotel.com"
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
                                            {loading ? "Signing In..." : "Sign In to Dashboard"}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>

                                        <FieldDescription className="text-center mt-4">
                                            New to our platform?{" "}
                                            <Link to="/owner/register" className="text-primary hover:underline">
                                                Register your property
                                            </Link>
                                        </FieldDescription>
                                        
                                        <div className="text-center mt-2">
                                            <Link
                                                to="/login"
                                                className="text-sm text-muted-foreground hover:text-foreground"
                                            >
                                                ← Back to user login
                                            </Link>
                                        </div>
                                    </Field>
                                </FieldGroup>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="mt-8 space-y-4">
                        <h3 className="text-sm font-semibold text-center text-muted-foreground">
                            Why Partner With Us?
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { title: "Reach More Guests", desc: "Millions of visitors" },
                                { title: "Easy Management", desc: "Simple dashboard" },
                                { title: "Secure Payments", desc: "Guaranteed payouts" },
                                { title: "24/7 Support", desc: "Always here to help" },
                            ].map((benefit, i) => (
                                <div key={i} className="text-center p-4 border rounded-lg bg-card">
                                    <div className="text-sm font-medium">{benefit.title}</div>
                                    <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HotelOwnerLoginPage
