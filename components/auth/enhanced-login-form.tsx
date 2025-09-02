"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2, ArrowRight, AlertCircle, CheckCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/hooks/use-auth"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
})

type FormData = z.infer<typeof formSchema>

export function EnhancedLoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const onSubmit = (data: FormData) => {
    console.log("🔐 Login form submitted with data:", { ...data, password: "[REDACTED]" })
    
    startTransition(async () => {
      try {
        setError(null)
        setSuccess(null)
        
        console.log("📡 Making login request...")
        
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important: include cookies
          body: JSON.stringify(data),
        })

        console.log("📥 Login response status:", response.status)
        
        let responseData
        try {
          responseData = await response.json()
          console.log("📦 Login response data:", responseData)
        } catch (parseError) {
          console.error("❌ Failed to parse response JSON:", parseError)
          throw new Error("Invalid response from server")
        }

        if (!response.ok) {
          console.error("❌ Login failed with status:", response.status)
          
          if (response.status === 401) {
            setError(responseData?.message || "Invalid email or password")
          } else if (response.status === 423) {
            setError(`Account locked. Try again in ${Math.ceil((responseData?.retryAfter || 1800) / 60)} minutes`)
          } else if (response.status === 429) {
            setError("Too many login attempts. Please try again later")
          } else {
            setError(responseData?.message || "Login failed. Please try again")
          }
          return
        }

        if (!responseData.success) {
          console.error("❌ Login response not successful:", responseData)
          setError(responseData.message || "Login failed")
          return
        }

        console.log("✅ Login successful!")
        setSuccess("Login successful! Redirecting...")

        // Update auth context if we have the login function
        if (login && responseData.data?.user) {
          console.log("🔄 Updating auth context...")
          login(responseData.data.user, responseData.data.accessToken || responseData.data.token, {})
        }

        // Wait a moment for cookies to be set
        setTimeout(() => {
          console.log("🔄 Redirecting...")
          
          // Check if user needs onboarding
          const user = responseData.data?.user
          if (user && !user.isOnboardingCompleted) {
            console.log("📋 User needs onboarding, redirecting to /onboarding")
            router.push("/onboarding")
          } else {
            console.log("🏠 User onboarding complete, redirecting to /dashboard")
            router.push("/dashboard")
          }
        }, 500)

      } catch (error) {
        console.error("❌ Login error:", error)
        setError(error instanceof Error ? error.message : "An unexpected error occurred")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Elevate360
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Login Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="h-11"
            disabled={isLoading}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="h-11 pr-10"
              disabled={isLoading}
              {...form.register("password")}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            disabled={isLoading}
            checked={form.watch("rememberMe")}
            onCheckedChange={(checked) => form.setValue("rememberMe", !!checked)}
          />
          <Label htmlFor="rememberMe" className="text-sm font-normal">
            Remember me for 7 days
          </Label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in to your account
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
            onClick={() => router.push("/auth/register")}
            disabled={isLoading}
          >
            Sign up
          </Button>
        </p>
        
        <p className="text-xs text-muted-foreground">
          Forgot your password?{" "}
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-blue-600 hover:text-blue-700"
            onClick={() => router.push("/auth/forgot-password")}
            disabled={isLoading}
          >
            Reset it here
          </Button>
        </p>
      </div>

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Form State: {form.formState.isValid ? "Valid" : "Invalid"}</p>
            <p>Loading: {isLoading ? "Yes" : "No"}</p>
            <p>Environment: {process.env.NODE_ENV}</p>
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
