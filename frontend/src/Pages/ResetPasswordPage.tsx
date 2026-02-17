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
import { Building2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useState } from "react"

export function ResetPasswordPage() {
  const [emailSubmitted, setEmailSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate email submission
    setEmailSubmitted(true)
  }

  if (emailSubmitted) {
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
          </div>
        </nav>

        {/* Success Message */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-24">
          <div className="w-full max-w-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Check Your Email</CardTitle>
                <CardDescription>
                  We've sent password reset instructions to your email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button 
                    onClick={() => setEmailSubmitted(false)}
                    className="text-primary hover:underline underline-offset-4"
                  >
                    try again
                  </button>
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Sign In
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Reset Password Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 pt-24">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you instructions to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email Address</FieldLabel>
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
                    <Button type="submit" className="w-full">
                      Send Reset Link
                    </Button>
                    <FieldDescription className="text-center">
                      Remember your password?{" "}
                      <Link to="/login" className="text-primary hover:underline">
                        Sign in
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

export default ResetPasswordPage
