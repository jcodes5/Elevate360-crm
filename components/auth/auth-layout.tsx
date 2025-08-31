import React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  cardTitle: string;
  cardDescription: string;
  backgroundPattern?: boolean;
}

export function AuthLayout({
  children,
  cardTitle,
  cardDescription,
  backgroundPattern = true,
}: AuthLayoutProps) {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Background Pattern */}
      {backgroundPattern && (
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      )}

      {/* Left Side - Branding */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-primary" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/placeholder-logo.svg"
            alt="Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <span className="text-xl">Elevate360</span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "Elevate360 has transformed how we manage our client
              relationships. The intuitive design and powerful features make it
              a joy to use."
            </p>
            <footer className="text-sm">Sarah Johnson, CEO at TechFlow</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px] lg:w-[400px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {cardTitle}
            </h1>
            <p className="text-sm text-muted-foreground">{cardDescription}</p>
          </div>

          {children}

          <p className="px-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
