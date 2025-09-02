"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Github, Chrome, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

export function ModernLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      login(result.data);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <Label htmlFor="email" className="text-white/90 text-sm font-medium">
            Email Address
          </Label>
          <motion.div 
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...form.register("email")}
              className="relative z-10 pl-12 h-14 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
            />
          </motion.div>
          {form.formState.errors.email && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-300 text-sm"
            >
              {form.formState.errors.email.message}
            </motion.p>
          )}
        </motion.div>

        {/* Password Field */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/90 text-sm font-medium">
              Password
            </Label>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-white/70 hover:text-white transition-colors duration-200"
            >
              Forgot password?
            </Link>
          </div>
          <motion.div 
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl backdrop-blur-sm" />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 z-10" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              {...form.register("password")}
              className="relative z-10 pl-12 pr-12 h-14 bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:ring-white/20 rounded-xl"
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-white/60 hover:text-white/80 transition-colors" />
              )}
            </motion.button>
          </motion.div>
          {form.formState.errors.password && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-300 text-sm"
            >
              {form.formState.errors.password.message}
            </motion.p>
          )}
        </motion.div>

        {/* Remember Me */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-2"
        >
          <Checkbox
            id="rememberMe"
            {...form.register("rememberMe")}
            className="border-white/30 data-[state=checked]:bg-white data-[state=checked]:text-purple-600"
          />
          <Label
            htmlFor="rememberMe"
            className="text-sm text-white/70 font-medium leading-none cursor-pointer"
          >
            Remember me for 30 days
          </Label>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
                Sign in to your account
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
        transition={{ delay: 0.5 }}
        className="relative my-6"
      >
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-gradient-to-r from-transparent via-purple-600/50 to-transparent px-4 py-1 text-white/60 font-medium">
            Or continue with
          </span>
        </div>
      </motion.div>

      {/* Social Login */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-3"
      >
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-12 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-xl backdrop-blur-sm group"
        >
          <Chrome className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          className="h-12 bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 rounded-xl backdrop-blur-sm group"
        >
          <Github className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          GitHub
        </Button>
      </motion.div>

      {/* Sign up link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center pt-4"
      >
        <p className="text-white/60 text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/register"
            className="text-white font-medium hover:text-white/80 transition-colors duration-200 underline decoration-white/30 hover:decoration-white/60 underline-offset-4"
          >
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
