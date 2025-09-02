"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles, Zap, TrendingUp, Shield } from "lucide-react";

interface ModernAuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const FloatingIcon = ({ Icon, className, delay }: { Icon: any; className: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.3, 0.8, 0.3],
      y: [0, -10, 0],
      rotate: [0, 5, 0]
    }}
    transition={{ 
      duration: 4,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute ${className}`}
  >
    <Icon className="w-6 h-6 text-white/30" />
  </motion.div>
);

export function ModernAuthLayout({ children, title, subtitle }: ModernAuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-700" />
        
        {/* Animated gradient overlays */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-tr from-pink-500/30 via-transparent to-cyan-500/30"
        />
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 6, delay: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-bl from-orange-400/20 via-transparent to-emerald-500/20"
        />

        {/* Floating geometric shapes */}
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-32 h-32 border border-white/10 rounded-full"
        />
        
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, delay: 5, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 right-32 w-24 h-24 border border-white/10 rounded-lg"
        />

        {/* Floating icons */}
        <FloatingIcon Icon={Sparkles} className="top-32 left-1/4" delay={0} />
        <FloatingIcon Icon={Zap} className="top-1/2 left-16" delay={1} />
        <FloatingIcon Icon={TrendingUp} className="bottom-1/3 right-20" delay={2} />
        <FloatingIcon Icon={Shield} className="top-1/4 right-1/3" delay={3} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Glass morphism card */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
            {/* Logo and branding */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/10 border border-white/20 backdrop-blur-sm mb-4">
                <Image
                  src="/placeholder-logo.svg"
                  alt="Elevate360 Logo"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2">
                {title}
              </h1>
              
              <p className="text-white/70 text-sm leading-relaxed">
                {subtitle}
              </p>
            </motion.div>

            {/* Form content */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {children}
            </motion.div>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
            <p className="text-white/60 text-xs">
              © {new Date().getFullYear()} Elevate360 CRM. Trusted by thousands of businesses worldwide.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Ambient light effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-radial from-purple-400/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-radial from-blue-400/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
}
