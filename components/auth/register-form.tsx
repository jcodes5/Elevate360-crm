"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Building, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
const Icons = {
  spinner: (props: any) => (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 0 1 8-8V2.5"
        stroke="currentColor"
        strokeWidth="4"
        className="opacity-75"
      />
    </svg>
  ),
  google: (props: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  ),
};
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types";
import { apiClient } from "@/lib/api-client";

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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  organizationName: z.string(),
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

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      if (!response.ok) {
        if (result.errors) {
          // Handle validation errors
          result.errors.forEach((error: { field: string; message: string }) => {
            form.setError(error.field as keyof FormData, {
              type: "manual",
              message: error.message
            });
          });
        } else {
          // Handle general error
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: result.message || "Something went wrong",
          });
        }
        return;
      }

      // Update auth context - no need to manually set cookies as they are httpOnly
      login(result.data.user, {
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        sessionId: result.data.sessionId
      }, {
        sessionId: result.data.sessionId
      });
      
      // Set token in API client for subsequent requests
      apiClient.setToken(result.data.accessToken);
      console.log("Token set in API client:", result.data.accessToken);

      // Show success message
      toast({
        title: "Welcome to Elevate360!",
        description: "Your account has been successfully created.",
      });

      // Redirect to onboarding
      router.push("/onboarding");
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="firstName"
                  placeholder="John"
                  disabled={isLoading}
                  {...form.register("firstName")}
                  className="pl-10 h-11"
                />
              </div>
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="lastName"
                  placeholder="Doe"
                  disabled={isLoading}
                  {...form.register("lastName")}
                  className="pl-10 h-11"
                />
              </div>
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <Label htmlFor="email" className="text-sm font-medium">
              Work Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...form.register("email")}
                className="pl-10 h-11"
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                disabled={isLoading}
                {...form.register("password")}
                className="pl-10 pr-10 h-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Eye className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <Label htmlFor="organizationName" className="text-sm font-medium">
              Organization Name
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="organizationName"
                placeholder="Company Inc."
                disabled={isLoading}
                {...form.register("organizationName", { required: false })}
                className="pl-10 h-11"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <Label htmlFor="role" className="text-sm font-medium">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-start space-x-3"
          >
            <div className="flex items-center h-5 mt-1">
              <input
                type="checkbox"
                id="acceptTerms"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                {...form.register("acceptTerms")}
              />
            </div>
            <div className="text-sm">
              <Label htmlFor="acceptTerms" className="font-medium">
                I accept the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline"
                >
                  terms and conditions
                </Link>
              </Label>
              {form.formState.errors.acceptTerms && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.acceptTerms.message}
                </p>
              )}
            {form.formState.errors.organizationName && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.organizationName.message}
              </p>
            )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button disabled={isLoading} className="w-full h-11" type="submit">
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>
          </motion.div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </motion.div>

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
          className="h-11"
        >
          <Icons.google className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-11"
        >
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}