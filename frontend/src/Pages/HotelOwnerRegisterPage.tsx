import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Mail, Lock, User, Phone, ArrowRight, Hotel, CheckCircle } from "lucide-react"
import { useState } from "react"

export function HotelOwnerRegisterPage() {
    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        hotelName: "",
        hotelType: "",
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const updateField = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
        setError("")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!formData.name || !formData.email || !formData.password) {
            setError("Please fill in all required fields")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            return
        }

        setLoading(true)

        // Simulate registration
        setTimeout(() => {
            // Store owner data
            localStorage.setItem("hotelOwner", JSON.stringify({
                id: "owner-" + Date.now(),
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                hotelName: formData.hotelName,
                isAuthenticated: true,
            }))

            setLoading(false)
            navigate("/owner/onboarding")
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
                        <span className="text-sm text-muted-foreground">Already a partner?</span>
                        <Button variant="outline" asChild>
                            <Link to="/owner/login">Sign In</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Registration Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-32">
                <div className="w-full max-w-lg">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Hotel className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">List Your Property</CardTitle>
                                    <CardDescription>
                                        Join thousands of hotel partners growing with us
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <div className="relative mt-1">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="name"
                                                    placeholder="John Doe"
                                                    value={formData.name}
                                                    onChange={(e) => updateField("name", e.target.value)}
                                                    className="pl-10"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative mt-1">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="phone"
                                                    type="tel"
                                                    placeholder="+91 98765 43210"
                                                    value={formData.phone}
                                                    onChange={(e) => updateField("phone", e.target.value)}
                                                    className="pl-10"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Business Email *</Label>
                                        <div className="relative mt-1">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="owner@hotel.com"
                                                value={formData.email}
                                                onChange={(e) => updateField("email", e.target.value)}
                                                className="pl-10"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="hotelName">Hotel / Property Name</Label>
                                        <div className="relative mt-1">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="hotelName"
                                                placeholder="The Grand Hotel"
                                                value={formData.hotelName}
                                                onChange={(e) => updateField("hotelName", e.target.value)}
                                                className="pl-10"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="hotelType">Property Type</Label>
                                        <select
                                            id="hotelType"
                                            value={formData.hotelType}
                                            onChange={(e) => updateField("hotelType", e.target.value)}
                                            className="w-full mt-1 p-2 border border-input rounded-md bg-background"
                                            disabled={loading}
                                        >
                                            <option value="">Select property type</option>
                                            <option value="hotel">Hotel</option>
                                            <option value="resort">Resort</option>
                                            <option value="boutique">Boutique Hotel</option>
                                            <option value="guesthouse">Guest House</option>
                                            <option value="homestay">Homestay</option>
                                            <option value="villa">Villa</option>
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="password">Password *</Label>
                                            <div className="relative mt-1">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => updateField("password", e.target.value)}
                                                    className="pl-10"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                                            <div className="relative mt-1">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                                                    className="pl-10"
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                                            {error}
                                        </div>
                                    )}

                                    <Button type="submit" className="w-full" disabled={loading}>
                                        {loading ? "Creating Account..." : "Create Account"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground">
                                        By creating an account, you agree to our{" "}
                                        <Link to="/terms" className="text-primary hover:underline">
                                            Terms of Service
                                        </Link>{" "}
                                        and{" "}
                                        <Link to="/privacy" className="text-primary hover:underline">
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Benefits */}
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-center text-muted-foreground mb-4">
                            Why Partner With Us?
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    title: "Zero Commission",
                                    desc: "Keep more of your earnings",
                                    icon: CheckCircle,
                                },
                                {
                                    title: "Instant Bookings",
                                    desc: "Real-time reservation system",
                                    icon: CheckCircle,
                                },
                                {
                                    title: "Secure Payments",
                                    desc: "Guaranteed payouts on time",
                                    icon: CheckCircle,
                                },
                                {
                                    title: "24/7 Support",
                                    desc: "We're always here to help",
                                    icon: CheckCircle,
                                },
                            ].map((benefit, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                                >
                                    <benefit.icon className="w-5 h-5 text-green-500 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium">{benefit.title}</div>
                                        <div className="text-xs text-muted-foreground">{benefit.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-muted-foreground hover:text-foreground"
                        >
                            ← Back to user login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HotelOwnerRegisterPage
