"use client"

import { motion } from "framer-motion"
import { CheckCircle, TrendingUp, Clock, DollarSign, Users, Target } from "lucide-react"

export function BenefitsSection() {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Increase Revenue by 40%",
      description: "Our automated workflows and lead nurturing help businesses close more deals faster.",
      stat: "40%",
      statLabel: "Revenue Increase",
    },
    {
      icon: Clock,
      title: "Save 20+ Hours Weekly",
      description: "Automate repetitive tasks and focus on what matters most - growing your business.",
      stat: "20+",
      statLabel: "Hours Saved",
    },
    {
      icon: Users,
      title: "Improve Customer Retention",
      description: "Better customer relationships through personalized communication and timely follow-ups.",
      stat: "85%",
      statLabel: "Retention Rate",
    },
    {
      icon: Target,
      title: "Higher Conversion Rates",
      description: "Convert more leads with targeted campaigns and intelligent lead scoring.",
      stat: "3x",
      statLabel: "Better Conversion",
    },
  ]

  const keyBenefits = [
    "Streamline your entire sales process",
    "Automate marketing campaigns across multiple channels",
    "Get real-time insights and analytics",
    "Improve team collaboration and productivity",
    "Scale your business operations efficiently",
    "Reduce manual work and human errors",
  ]

  return (
    <section id="benefits" className="py-20 bg-background">
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
            Transform Your Business{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Results</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of Nigerian businesses that have already transformed their operations and achieved remarkable
            growth with Elevate360 CRM.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-2 border border-border">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{benefit.stat}</div>
                <div className="text-sm text-primary font-semibold mb-4">{benefit.statLabel}</div>
                <h3 className="text-lg font-bold text-foreground mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Benefits List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-8">Why Choose Elevate360 CRM?</h3>
            <div className="space-y-4">
              {keyBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Success Story */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8 border border-border"
          >
            <div className="text-center mb-6">
              <DollarSign className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
              <h4 className="text-2xl font-bold text-foreground mb-2">Success Story</h4>
              <p className="text-muted-foreground">Real results from our customers</p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
              <blockquote className="text-foreground italic mb-4">
                "Since implementing Elevate360 CRM, our sales have increased by 45% and we've reduced our administrative
                work by 60%. The automation features are game-changing for our business operations."
              </blockquote>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg mr-4">
                  AO
                </div>
                <div>
                  <div className="font-semibold text-foreground">Adebayo Ogundimu</div>
                  <div className="text-sm text-muted-foreground">CEO, TechStart Lagos</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">45%</div>
                <div className="text-xs text-muted-foreground">Sales Increase</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">60%</div>
                <div className="text-xs text-muted-foreground">Time Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">3x</div>
                <div className="text-xs text-muted-foreground">ROI Growth</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
