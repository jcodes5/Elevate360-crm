"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthSplitLayout({ 
  children, 
  title = "Welcome to Elevate300",
  subtitle = "The complete CRM solution for modern businesses"
}: AuthSplitLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary to-primary/90 text-white p-12"
      >
        <div className="flex items-center">
          <div className="bg-white/20 p-2 rounded-lg">
            <Image
              src="/placeholder-logo.svg"
              alt="Elevate360 Logo"
              width={40}
              height={40}
            />
          </div>
          <span className="ml-3 text-2xl font-bold">Elevate360</span>
        </div>
        
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Transform Your Customer Relationships
          </h1>
          <p className="text-lg text-white/90">
            The all-in-one CRM platform that helps you close deals faster, 
            improve customer service, and grow your business.
          </p>
          <div className="pt-4">
            <blockquote className="space-y-4 border-l-2 border-white/30 pl-6">
              <p className="text-xl italic">
                "Elevate360 has transformed how we manage our customer relationships. 
                The intuitive interface and powerful features have made our team more productive than ever."
              </p>
              <footer className="text-sm font-medium">
                Sarah Johnson, CEO of TechFlow
              </footer>
            </blockquote>
          </div>
        </div>
        
        <div className="text-sm text-white/70">
          <p>© {new Date().getFullYear()} Elevate360 CRM. All rights reserved.</p>
        </div>
      </motion.div>
      
      {/* Right side - Form */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center p-6 sm:p-8 md:p-12"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Image
                  src="/placeholder-logo.svg"
                  alt="Elevate360 Logo"
                  width={48}
                  height={48}
                  className="text-primary"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {subtitle}
            </p>
          </div>
          
          <div className="mt-8">
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  );
}