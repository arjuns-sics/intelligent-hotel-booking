import { Link } from "react-router-dom"
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
import { Building2, Mail, Lock, ArrowRight } from "lucide-react"

export function LoginPage() {
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
                        <span className="text-sm text-muted-foreground">Don't have an account?</span>
                        <Button variant="outline" asChild>
                            <Link to="/register">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Login Form */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-24">
                <div className="w-full max-w-sm">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">Welcome Back</CardTitle>
                            <CardDescription>
                                Enter your credentials to access your account
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="john@example.com"
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </Field>
                                    <Field>
                                        <div className="flex items-center justify-between">
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Link
                                                to="/reset-password"
                                                className="text-sm text-primary hover:underline underline-offset-4"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                required
                                                className="pl-10"
                                            />
                                        </div>
                                    </Field>
                                    <Field>
                                        <Button type="submit" className="w-full">
                                            Sign In
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                        \
                                        <FieldDescription className="text-center">
                                            Don't have an account?{" "}
                                            <Link to="/register" className="text-primary hover:underline">
                                                Sign up
                                            </Link>
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

export default LoginPage
