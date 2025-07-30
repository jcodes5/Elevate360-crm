"use client"

import { motion } from "framer-motion"
import { Target, Users, Award, Globe, Heart, Lightbulb } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function AboutSection() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Empowering Nigerian businesses with world-class CRM technology to compete globally.",
    },
    {
      icon: Users,
      title: "Customer-Centric",
      description: "Every feature we build is designed with our customers' success in mind.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from product quality to customer service.",
    },
    {
      icon: Globe,
      title: "Local Expertise",
      description: "Deep understanding of Nigerian business culture and market dynamics.",
    },
    {
      icon: Heart,
      title: "Passionate Team",
      description: "Our team is passionate about helping businesses grow and succeed.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Continuously innovating to provide cutting-edge solutions for modern businesses.",
    },
  ]

  const team = [
    {
      name: "Olumide Adebayo",
      role: "CEO & Founder",
      bio: "Former software engineer at Google with 10+ years experience building scalable platforms.",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      name: "Kemi Oladele",
      role: "CTO",
      bio: "Tech lead with expertise in cloud architecture and enterprise software development.",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      name: "Ibrahim Musa",
      role: "Head of Product",
      bio: "Product strategist focused on creating intuitive user experiences for business software.",
      avatar: "/placeholder.svg?height=120&width=120",
    },
    {
      name: "Chioma Nwankwo",
      role: "Head of Customer Success",
      bio: "Dedicated to ensuring every customer achieves their business goals with our platform.",
      avatar: "/placeholder.svg?height=120&width=120",
    },
  ]

  const milestones = [
    {
      year: "2022",
      event: "Company Founded",
      description: "Started with a vision to revolutionize CRM for Nigerian businesses",
    },
    {
      year: "2023",
      event: "First 1,000 Users",
      description: "Reached our first major milestone with businesses across Nigeria",
    },
    {
      year: "2024",
      event: "Series A Funding",
      description: "Secured funding to accelerate product development and expansion",
    },
    { year: "2024", event: "10,000+ Customers", description: "Became the leading CRM platform for Nigerian SMEs" },
  ]

  return (
    <section id="about" className="py-20 bg-background">
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
            About{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Elevate360</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're on a mission to empower Nigerian businesses with world-class CRM technology. Built by Nigerians, for
            Nigerians, with a deep understanding of local business needs.
          </p>
        </motion.div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-3xl font-bold text-foreground mb-6">Our Story</h3>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Elevate360 CRM was born out of frustration with existing CRM solutions that didn't understand the unique
                challenges of Nigerian businesses. As entrepreneurs ourselves, we experienced firsthand the limitations
                of international platforms that lacked local payment integration, cultural understanding, and affordable
                pricing.
              </p>
              <p>
                In 2022, we set out to build something different - a CRM platform designed specifically for Nigerian
                businesses, with features that matter to local entrepreneurs and pricing that makes sense for our
                market.
              </p>
              <p>
                Today, we're proud to serve over 10,000 businesses across Nigeria, helping them streamline operations,
                increase sales, and compete on a global scale while staying true to their local roots.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8 border border-border">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
                  <div className="text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">50+</div>
                  <div className="text-muted-foreground">Team Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">99.9%</div>
                  <div className="text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                  <div className="text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Our Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border shadow-sm group hover:-translate-y-1 bg-card">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <value.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-xl font-bold text-foreground mb-3">{value.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Meet Our Team</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 p-1">
                    <img
                      src={member.avatar || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                </div>
                <h4 className="text-xl font-bold text-foreground mb-2">{member.name}</h4>
                <p className="text-primary font-semibold mb-3">{member.role}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-foreground text-center mb-12">Our Journey</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary to-secondary rounded-full"></div>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                    <div className="bg-card rounded-xl p-6 shadow-lg border border-border">
                      <div className="text-2xl font-bold text-primary mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-bold text-foreground mb-2">{milestone.event}</h4>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="relative z-10 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full border-4 border-background shadow-lg"></div>

                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
