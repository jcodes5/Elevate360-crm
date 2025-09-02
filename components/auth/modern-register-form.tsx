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
  Check
} from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import type { User } from "@/types";

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
        strokeWidth="2"
        className="opacity-25"
      />
      <path
        d="M4 12a8 8 0 0 1 8-8V2.5"
        stroke="currentColor"
        strokeWidth="2"
        className="opacity-75"
      />
    </svg>
  ),
};

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
  organizationName: z.string().optional(),
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

export function ModernRegisterForm() {
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
          result.errors.forEach((error: { field: string; message: string }) => {
            form.setError(error.field as keyof FormData, {
              type: "manual",
              message: error.message
            });
          });
        } else {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: result.message || "Something went wrong",
          });
        }
        return;
      }

      login(result.data);
      toast({
        title: "Welcome to Elevate360!",
        description: "Your account has been successfully created.",
      });
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

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <Label htmlFor="firstName" className="text-white/90 text-sm font-medium">
              First Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
              <Input
                id="firstName"
                placeholder="John"
                disabled={isLoading}
                {...form.register("firstName")}
                className="relative z-10 pl-12 h-12 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
            </motion.div>
            {form.formState.errors.firstName && (
              <p className="text-red-300 text-sm">{form.formState.errors.firstName.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <Label htmlFor="lastName" className="text-white/90 text-sm font-medium">
              Last Name
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
              <Input
                id="lastName"
                placeholder="Doe"
                disabled={isLoading}
                {...form.register("lastName")}
                className="relative z-10 pl-12 h-12 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
            </motion.div>
            {form.formState.errors.lastName && (
              <p className="text-red-300 text-sm">{form.formState.errors.lastName.message}</p>
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
          <Label htmlFor="email" className="text-white/90 text-sm font-medium">
            Work Email
          </Label>
          <motion.div variants={inputVariants} whileFocus="focus" className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...form.register("email")}
              className="relative z-10 pl-12 h-12 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
            />
          </motion.div>
          {form.formState.errors.email && (
            <p className="text-red-300 text-sm">{form.formState.errors.email.message}</p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <Label htmlFor="password" className="text-white/90 text-sm font-medium">
            Password
          </Label>
          <motion.div variants={inputVariants} whileFocus="focus" className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              {...form.register("password")}
              className="relative z-10 pl-12 pr-12 h-12 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/60" />
              ) : (
                <Eye className="h-5 w-5 text-white/60" />
              )}
            </button>
          </motion.div>
          {form.formState.errors.password && (
            <p className="text-red-300 text-sm">{form.formState.errors.password.message}</p>
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
            <Label htmlFor="organizationName" className="text-white/90 text-sm font-medium">
              Organization
            </Label>
            <motion.div variants={inputVariants} whileFocus="focus" className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
              <Input
                id="organizationName"
                placeholder="Company Inc."
                disabled={isLoading}
                {...form.register("organizationName", { required: false })}
                className="relative z-10 pl-12 h-12 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <Label htmlFor="role" className="text-white/90 text-sm font-medium">
              Role
            </Label>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
              <Select
                defaultValue={form.getValues("role")}
                onValueChange={(value) =>
                  form.setValue("role", value as "admin" | "manager" | "agent")
                }
                disabled={isLoading}
              >
                <SelectTrigger className="relative z-10 h-12 bg-transparent border-white/20 text-white focus:border-white/40 focus:ring-white/20 rounded-xl">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-white/20 text-white">
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="agent">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              className="h-4 w-4 rounded border-white/30 bg-white/10 text-white focus:ring-white/20 focus:ring-offset-0"
              {...form.register("acceptTerms")}
            />
          </div>
          <div className="text-sm">
            <Label htmlFor="acceptTerms" className="text-white/70 font-medium">
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-white hover:text-white/80 underline decoration-white/30 hover:decoration-white/60 underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-white hover:text-white/80 underline decoration-white/30 hover:decoration-white/60 underline-offset-4"
              >
                Privacy Policy
              </Link>
            </Label>
            {form.formState.errors.acceptTerms && (
              <p className="text-red-300 text-sm mt-1">
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
            className="w-full h-14 bg-gradient-to-r from-white to-white/90 text-purple-700 font-semibold rounded-xl hover:from-white/90 hover:to-white/80 transition-all duration-300 shadow-lg hover:shadow-xl group" 
            type="submit"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <>
                <Check className="mr-2 h-5 w-5" />
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
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gradient-to-r from-transparent via-purple-600/50 to-transparent px-4 py-1 text-white/60 font-medium">
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
          className="h-12 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-xl backdrop-blur-sm"
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-12 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-xl backdrop-blur-sm"
        >
          <Github className="mr-2 h-4 w-4" />
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
        <p className="text-white/60 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-white font-medium hover:text-white/80 transition-colors duration-200 underline decoration-white/30 hover:decoration-white/60 underline-offset-4"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
