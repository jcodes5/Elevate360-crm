"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Adebayo Ogundimu",
      role: "CEO",
      company: "TechStart Lagos",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Elevate360 CRM has completely transformed how we manage our customer relationships. The automation features alone have saved us 20+ hours per week, and our conversion rates have increased by 45%. Best investment we've made for our business!",
      results: "45% increase in conversions",
    },
    {
      name: "Fatima Abdullahi",
      role: "Marketing Director",
      company: "GrowthHub Nigeria",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "The multi-channel marketing capabilities are incredible. We can now reach our customers through email, SMS, and WhatsApp from one platform. Our customer engagement has never been higher, and the ROI tracking is phenomenal.",
      results: "300% improvement in engagement",
    },
    {
      name: "Chinedu Okwu",
      role: "Sales Manager",
      company: "ProSales Africa",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "As someone who's used several CRM platforms, I can confidently say Elevate360 is the best for Nigerian businesses. The local payment integration and understanding of our market dynamics makes all the difference.",
      results: "60% faster deal closure",
    },
    {
      name: "Aisha Mohammed",
      role: "Founder",
      company: "EduTech Solutions",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "The visual workflow builder is a game-changer. We've automated our entire student onboarding process, from initial inquiry to course enrollment. The time savings and improved student experience have been remarkable.",
      results: "80% reduction in manual work",
    },
    {
      name: "Olumide Adeyemi",
      role: "Operations Manager",
      company: "RetailMax Nigeria",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "The reporting and analytics features give us insights we never had before. We can track every aspect of our customer journey and make data-driven decisions. Our team productivity has increased significantly.",
      results: "50% boost in team productivity",
    },
    {
      name: "Grace Eze",
      role: "Business Owner",
      company: "Fashion Forward Lagos",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Customer support is exceptional! The team understands Nigerian business challenges and provides solutions that actually work. The mobile app keeps me connected to my business even when I'm traveling.",
      results: "95% customer satisfaction",
    },
  ]

  const stats = [
    { value: "10,000+", label: "Happy Customers" },
    { value: "4.9/5", label: "Average Rating" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/5 dark:from-primary/10 dark:via-background dark:to-secondary/10">
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
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Nigerian Businesses
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our customers have to say about their experience with
            Elevate360 CRM.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-border shadow-lg group hover:-translate-y-2 bg-card">
                <CardContent className="p-8">
                  {/* Quote Icon */}
                  <div className="w-12 h-12 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-full flex items-center justify-center mb-6">
                    <Quote className="w-6 h-6 text-primary" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>

                  {/* Results Badge */}
                  <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-green-800 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 inline-block">
                    {testimonial.results}
                  </div>

                  {/* Author */}
                  <div className="flex items-center">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}, {testimonial.company}
                      </div>
                    </div>
                  </div>
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
          transition={{ duration: 0.6 }}
          className="text-center bg-card rounded-2xl p-8 shadow-lg border border-border"
        >
          <h3 className="text-2xl font-bold text-foreground mb-4">Join Thousands of Satisfied Customers</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Start your free trial today and see why Nigerian businesses choose Elevate360 CRM to grow their operations
            and increase revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Start Free Trial
            </button>
            <button className="border-2 border-border hover:border-primary text-foreground hover:text-primary px-8 py-3 rounded-xl font-semibold transition-all duration-200 bg-background">
              Read More Reviews
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
