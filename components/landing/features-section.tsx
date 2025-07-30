"use client"

import { motion } from "framer-motion"
import { Users, MessageSquare, BarChart3, Calendar, Workflow, Shield, Smartphone, Globe, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Contact Management",
      description:
        "Organize and manage all your contacts in one place with detailed profiles, interaction history, and smart segmentation.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: MessageSquare,
      title: "Multi-Channel Marketing",
      description:
        "Reach customers through email, SMS, and WhatsApp with automated campaigns and personalized messaging.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: BarChart3,
      title: "Sales Pipeline",
      description:
        "Track deals through every stage with visual pipelines, probability scoring, and revenue forecasting.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Seamlessly book and manage appointments with calendar integration and automated reminders.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Workflow,
      title: "Marketing Automation",
      description:
        "Create sophisticated workflows with our visual builder to automate your marketing and sales processes.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Shield,
      title: "Advanced Security",
      description:
        "Enterprise-grade security with role-based access control, data encryption, and compliance features.",
      color: "from-red-500 to-red-600",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Access your CRM anywhere with our responsive design and mobile-first approach.",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Globe,
      title: "Nigerian Focused",
      description:
        "Built specifically for Nigerian businesses with local payment integration and market understanding.",
      color: "from-teal-500 to-teal-600",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Stay synchronized with instant notifications, live data updates, and collaborative features.",
      color: "from-yellow-500 to-yellow-600",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Modern Businesses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to manage customers, automate marketing, and grow your business - all in one
            comprehensive platform designed for Nigerian entrepreneurs.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-border shadow-lg group hover:-translate-y-2 bg-card">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">Ready to experience these powerful features?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Start Free Trial
            </button>
            <button className="border-2 border-border hover:border-primary text-foreground hover:text-primary px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-background">
              Schedule Demo
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
