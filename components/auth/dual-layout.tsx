"use client";

"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  Zap, 
  Star,
  CheckCircle,
  ArrowRight,
  Quote
} from "lucide-react";

interface DualLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  type: "login" | "register";
}

const testimonials = [
  {
    quote: "Elevate360 transformed our customer relationships completely. Our sales increased by 40% in just 3 months.",
    author: "Sarah Johnson",
    role: "CEO, TechFlow Solutions",
    avatar: "/placeholder.svg"
  },
  {
    quote: "The automation features saved us 20+ hours per week. Best CRM investment we've ever made.",
    author: "Michael Chen",
    role: "Sales Director, GrowthCorp",
    avatar: "/placeholder.svg"
  },
  {
    quote: "Intuitive interface, powerful features, and excellent support. Exactly what we needed.",
    author: "Emily Rodriguez",
    role: "Marketing Manager, StartupX",
    avatar: "/placeholder.svg"
  }
];

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and security protocols"
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Real-time insights to boost your revenue"
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Seamless workflows for your entire team"
  },
  {
    icon: Zap,
    title: "Automation",
    description: "Smart workflows that save time and effort"
  }
];

const FloatingIcon = ({ Icon, className, delay }: { Icon: any; className: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, rotate: 0 }}
    animate={{ 
      opacity: [0.4, 0.8, 0.4],
      y: [0, -15, 0],
      rotate: [0, 5, 0]
    }}
    transition={{ 
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className={`absolute ${className}`}
  >
    <Icon className="w-6 h-6 text-white/30" />
  </motion.div>
);

export function DualLayout({ children, title, subtitle, type }: DualLayoutProps) {
  const currentTestimonial = testimonials[0];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Information */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">
        {/* Background with gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)
              `,
              backgroundSize: "100% 100%"
            }}
          />
        </div>

        {/* Floating icons */}
        <FloatingIcon Icon={Shield} className="top-20 left-20" delay={0} />
        <FloatingIcon Icon={TrendingUp} className="top-40 right-32" delay={1} />
        <FloatingIcon Icon={Users} className="bottom-40 left-16" delay={2} />
        <FloatingIcon Icon={Zap} className="bottom-20 right-20" delay={3} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-8">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/30">
                <Image
                  src="/placeholder-logo.svg"
                  alt="Elevate360 Logo"
                  width={32}
                  height={32}
                  className="brightness-0 invert"
                />
              </div>
              <span className="ml-3 text-2xl font-bold text-white">Elevate360</span>
            </div>
          </motion.div>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
                {type === "login" ? (
                  <>Welcome back to the future of <span className="text-blue-300">CRM</span></>
                ) : (
                  <>Join thousands growing with <span className="text-blue-300">Elevate360</span></>
                )}
              </h1>
              
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                {type === "login" 
                  ? "Access your dashboard and continue building meaningful customer relationships."
                  : "Start your journey to better customer relationships and increased revenue today."
                }
              </p>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                  >
                    <feature.icon className="w-6 h-6 text-blue-300 mb-2" />
                    <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                    <p className="text-white/70 text-xs leading-relaxed">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20"
          >
            <div className="flex items-start space-x-4">
              <Quote className="w-8 h-8 text-blue-300 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white/90 italic mb-4 leading-relaxed">
                  "{currentTestimonial.quote}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                    <span className="text-white font-semibold text-sm">
                      {currentTestimonial.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{currentTestimonial.author}</p>
                    <p className="text-white/70 text-xs">{currentTestimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex items-center justify-between mt-8 pt-8 border-t border-white/20"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div className="text-white/70 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/70 text-sm">Uptime</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center text-2xl font-bold text-white">
                4.9 <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 ml-1" />
              </div>
              <div className="text-white/70 text-sm">Rating</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-700 mb-4">
              <Image
                src="/placeholder-logo.svg"
                alt="Elevate360 Logo"
                width={32}
                height={32}
                className="brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Elevate360</h1>
          </motion.div>

          {/* Form header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Form content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {children}
          </motion.div>

          {/* Security badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center justify-center space-x-2 mt-8 text-sm text-gray-500 dark:text-gray-400"
          >
            <Shield className="w-4 h-4" />
            <span>256-bit SSL encrypted</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
