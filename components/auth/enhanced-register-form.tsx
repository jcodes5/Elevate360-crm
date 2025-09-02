"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Building, 
  Github, 
  Chrome,
  ArrowRight,
  Check,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  firstName: z.string().min(1, "First name is required").max(50, "First name is too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name is too long"),
  organizationName: z.string().max(100, "Organization name is too long").optional(),
  role: z.enum(["admin", "manager", "agent"]),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface RegisterResponseData {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const requirements = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { label: "One number", test: (p: string) => /[0-9]/.test(p) },
    { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const score = requirements.filter(req => req.test(password)).length;
  const strength = score === 0 ? 0 : (score / requirements.length) * 100;

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              strength > (i + 1) * 25 
                ? strength < 50 
                  ? "bg-red-400" 
                  : strength < 75 
                  ? "bg-yellow-400" 
                  : "bg-green-400"
                : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className={cn(
              "w-3 h-3 rounded-full flex items-center justify-center",
              req.test(password) ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            )}>
              {req.test(password) && <Check className="w-2 h-2" />}
            </div>
            <span className={cn(
              req.test(password) ? "text-green-600" : "text-gray-500"
            )}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function EnhancedRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      role: "agent",
      acceptTerms: false,
    },
  });

  const watchPassword = form.watch("password");

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Submitting registration form with data:", { ...data, password: "[REDACTED]" });

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          organizationName: data.organizationName,
          role: data.role
        }),
      });

      const result = await response.json();
      console.log("Registration response:", { ...result, data: result.data ? "[REDACTED]" : null });

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          // Handle field-specific validation errors
          result.errors.forEach((error: { field: string; message: string }) => {
            if (error.field && error.field in data) {
              form.setError(error.field as keyof FormData, {
                type: "manual",
                message: error.message
              });
            }
          });
          setError("Please fix the errors below and try again.");
        } else {
          setError(result.message || "Registration failed. Please try again.");
        }
        return;
      }

      if (result.success && result.data) {
        setSuccess("Account created successfully! Redirecting...");
        login(result.data);
        
        toast({
          title: "Welcome to Elevate360! 🎉",
          description: "Your account has been successfully created.",
        });

        // Small delay to show success message
        setTimeout(() => {
          router.push("/onboarding");
        }, 1500);
      } else {
        setError("Invalid response format. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Success Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              First Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="firstName"
                placeholder="John"
                disabled={isLoading}
                {...form.register("firstName")}
                className={cn(
                  "pl-10 h-11 transition-all duration-200",
                  form.formState.errors.firstName && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
            </motion.div>
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.firstName.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Last Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="lastName"
                placeholder="Doe"
                disabled={isLoading}
                {...form.register("lastName")}
                className={cn(
                  "pl-10 h-11 transition-all duration-200",
                  form.formState.errors.lastName && "border-red-300 focus:border-red-500 focus:ring-red-500"
                )}
              />
            </motion.div>
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.lastName.message}</p>
            )}
          </motion.div>
        </div>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Work Email
          </Label>
          <motion.div variants={inputVariants} whileFocus="focus" className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...form.register("email")}
              className={cn(
                "pl-10 h-11 transition-all duration-200",
                form.formState.errors.email && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
          </motion.div>
          {form.formState.errors.email && (
            <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.email.message}</p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </Label>
          <motion.div variants={inputVariants} whileFocus="focus" className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              disabled={isLoading}
              {...form.register("password")}
              className={cn(
                "pl-10 pr-10 h-11 transition-all duration-200",
                form.formState.errors.password && "border-red-300 focus:border-red-500 focus:ring-red-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </motion.div>
          <PasswordStrength password={watchPassword} />
          {form.formState.errors.password && (
            <p className="text-sm text-red-600 dark:text-red-400">{form.formState.errors.password.message}</p>
          )}
        </motion.div>

        {/* Organization and Role */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Organization <span className="text-gray-400">(Optional)</span>
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="organizationName"
                placeholder="Company Inc."
                disabled={isLoading}
                {...form.register("organizationName")}
                className="pl-10 h-11 transition-all duration-200"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role
            </Label>
            <Select
              defaultValue={form.getValues("role")}
              onValueChange={(value) =>
                form.setValue("role", value as "admin" | "manager" | "agent")
              }
              disabled={isLoading}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="agent">Team Member</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>

        {/* Terms and Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-start space-x-3 pt-2"
        >
          <div className="flex items-center h-5 mt-1">
            <input
              type="checkbox"
              id="acceptTerms"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
              {...form.register("acceptTerms")}
              disabled={isLoading}
            />
          </div>
          <div className="text-sm">
            <Label htmlFor="acceptTerms" className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-200 hover:decoration-blue-400 underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 underline decoration-blue-200 hover:decoration-blue-400 underline-offset-4"
              >
                Privacy Policy
              </Link>
            </Label>
            {form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {form.formState.errors.acceptTerms.message}
              </p>
            )}
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pt-2"
        >
          <Button 
            disabled={isLoading} 
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group" 
            type="submit"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" />
                Create Account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
              </>
            )}
          </Button>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative my-6"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300 dark:border-gray-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
            Or sign up with
          </span>
        </div>
      </motion.div>

      {/* Social Registration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-2 gap-3"
      >
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <Chrome className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
        >
          <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          GitHub
        </Button>
      </motion.div>

      {/* Sign in link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center pt-4"
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline decoration-blue-200 hover:decoration-blue-400 underline-offset-4"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
