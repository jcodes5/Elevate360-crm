"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { Check, Star, Zap, Crown, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false)

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      description: "Perfect for small businesses getting started",
      monthlyPrice: 15000,
      annualPrice: 150000,
      color: "from-blue-500 to-blue-600",
      popular: false,
      features: [
        "Up to 1,000 contacts",
        "Basic email marketing",
        "Sales pipeline management",
        "Task management",
        "Mobile app access",
        "Email support",
        "Basic reporting",
        "2 team members",
      ],
    },
    {
      name: "Professional",
      icon: Star,
      description: "Ideal for growing businesses with advanced needs",
      monthlyPrice: 35000,
      annualPrice: 350000,
      color: "from-purple-500 to-purple-600",
      popular: true,
      features: [
        "Up to 10,000 contacts",
        "Advanced email & SMS marketing",
        "WhatsApp integration",
        "Marketing automation workflows",
        "Advanced reporting & analytics",
        "Calendar integration",
        "Priority support",
        "10 team members",
        "Custom fields & tags",
        "Lead scoring",
      ],
    },
    {
      name: "Enterprise",
      icon: Crown,
      description: "For large organizations with complex requirements",
      monthlyPrice: 75000,
      annualPrice: 750000,
      color: "from-orange-500 to-orange-600",
      popular: false,
      features: [
        "Unlimited contacts",
        "All marketing channels",
        "Advanced automation",
        "Custom integrations",
        "White-label options",
        "Dedicated account manager",
        "24/7 phone support",
        "Unlimited team members",
        "Advanced security features",
        "Custom reporting",
        "API access",
        "Training & onboarding",
      ],
    },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <section id="pricing" className="py-20 bg-muted/30">
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
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your business. All plans include a 14-day free trial with no credit card
            required.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-lg font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary"
            />
            <span className={`text-lg font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                Save 17%
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm font-semibold">
                    <Rocket className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full ${plan.popular ? "ring-2 ring-primary shadow-2xl scale-105" : "shadow-lg"} hover:shadow-xl transition-all duration-300 border-border bg-card`}
              >
                <CardHeader className="text-center pb-8">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mx-auto mb-4`}
                  >
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-foreground">
                        {formatPrice(isAnnual ? plan.annualPrice / 12 : plan.monthlyPrice)}
                      </span>
                      <span className="text-muted-foreground ml-2">/month</span>
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Billed annually ({formatPrice(plan.annualPrice)})
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button
                    className={`w-full mb-8 py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
                      plan.popular
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                        : "bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg hover:shadow-xl"
                    }`}
                  >
                    Start Free Trial
                  </Button>

                  <ul className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                          <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-center text-primary-foreground"
        >
          <h3 className="text-2xl font-bold mb-4">Need a Custom Solution?</h3>
          <p className="text-primary-foreground/80 mb-6 max-w-2xl mx-auto">
            For large enterprises with specific requirements, we offer custom pricing and features tailored to your
            unique business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              className="bg-background text-foreground hover:bg-background/90 px-8 py-3 text-lg font-semibold rounded-xl"
            >
              Contact Sales
            </Button>
            <Button
              variant="outline"
              className="border-2 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3 text-lg font-semibold rounded-xl bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-2">Can I change plans anytime?</h4>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-2">Is there a setup fee?</h4>
              <p className="text-muted-foreground">
                No setup fees. We provide free onboarding and training to get you started quickly.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-2">What payment methods do you accept?</h4>
              <p className="text-muted-foreground">
                We accept all major Nigerian payment methods including bank transfers, cards, and mobile money.
              </p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-foreground mb-2">Is my data secure?</h4>
              <p className="text-muted-foreground">
                Absolutely. We use enterprise-grade security with encryption and regular backups.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
