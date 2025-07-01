"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Clock, Award, Phone, Mail, MapPin, Star } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Counter Animation Hook
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration, isVisible])

  return { count, setIsVisible }
}

// Intersection Observer Hook
function useInView(threshold = 0.1) {
  const [ref, setRef] = useState<HTMLElement | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    if (!ref) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      { threshold },
    )

    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref, threshold])

  return [setRef, isInView] as const
}

export default function HomePage() {
  const [studentsRef, studentsInView] = useInView()
  const [teachersRef, teachersInView] = useInView()
  const [experienceRef, experienceInView] = useInView()

  const { count: studentsCount, setIsVisible: setStudentsVisible } = useCounter(500)
  const { count: teachersCount, setIsVisible: setTeachersVisible } = useCounter(50)
  const { count: experienceCount, setIsVisible: setExperienceVisible } = useCounter(10)

  useEffect(() => {
    if (studentsInView) setStudentsVisible(true)
  }, [studentsInView, setStudentsVisible])

  useEffect(() => {
    if (teachersInView) setTeachersVisible(true)
  }, [teachersInView, setTeachersVisible])

  useEffect(() => {
    if (experienceInView) setExperienceVisible(true)
  }, [experienceInView, setExperienceVisible])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95 transition-all duration-300">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 animate-fade-in">
              <Image
                src="/images/logo-icon.png"
                alt="AL Mursalaat Online Islamic Academy"
                width={600}
                height={300}
                className="h-16 w-auto transition-transform duration-600 hover:scale-105"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              {["Home", "Courses", "About", "Admission", "Contact"].map((item, index) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-primary hover:text-secondary transition-all duration-300 hover:scale-110 relative group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
            <Button className="bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-bounce-subtle">
              Apply Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="home"
        className="py-20 relative overflow-hidden min-h-[600px]"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 84, 71, 0.8), rgba(19, 84, 71, 0.6)), url('/images/mosque-interior.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Additional overlay for better text readability */}
        {/* Logo pattern overlay for perfect blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#DAF1DE]/60 via-[#9EB69B]/40 to-[#DAF1DE]/60"></div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white animate-slide-in-left">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up drop-shadow-lg">
                  Learn Al-Quran in English Online
                </h1>
                <p
                  className="text-xl mb-8 text-green-100 animate-fade-in-up drop-shadow-md"
                  style={{ animationDelay: "200ms" }}
                >
                  Join AL Mursalaat Online Islamic Academy and embark on a spiritual journey to understand the Holy
                  Quran with expert guidance and personalized learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                  <Button
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Start Your Journey
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-sm transform transition-all duration-300 hover:scale-105"
                  >
                    Watch Demo
                  </Button>
                </div>
                <div
                  className="mt-8 flex items-center space-x-6 animate-fade-in-up"
                  style={{ animationDelay: "600ms" }}
                >
                  <div className="text-center transform transition-all duration-300 hover:scale-110" ref={studentsRef}>
                    <div className="text-2xl font-bold drop-shadow-lg">{studentsCount}+</div>
                    <div className="text-sm text-green-200">Students</div>
                  </div>
                  <div className="text-center transform transition-all duration-300 hover:scale-110" ref={teachersRef}>
                    <div className="text-2xl font-bold drop-shadow-lg">{teachersCount}+</div>
                    <div className="text-sm text-green-200">Qualified Teachers</div>
                  </div>
                  <div
                    className="text-center transform transition-all duration-300 hover:scale-110"
                    ref={experienceRef}
                  >
                    <div className="text-2xl font-bold drop-shadow-lg">{experienceCount}+</div>
                    <div className="text-sm text-green-200">Years Experience</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center animate-slide-in-right">
                <div className="relative">
                  {/* Background glow for logo visibility */}
                  <div className="absolute inset-0 backdrop-blur-sm rounded-full scale-110 bg-white opacity-0"></div>
                  <Image
                    src="/images/logo-full.png"
                    alt="AL Mursalaat Academy Logo"
                    width={400}
                    height={400}
                    className="w-full max-w-md animate-float relative z-10 drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Why Choose Our Academy?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience the best online Quranic education with our comprehensive learning platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Expert Teachers",
                desc: "Learn from qualified Islamic scholars and experienced Quran teachers",
                color: "text-primary",
              },
              {
                icon: Users,
                title: "One-on-One Classes",
                desc: "Personalized attention with individual online sessions",
                color: "text-secondary",
              },
              {
                icon: Clock,
                title: "Flexible Timing",
                desc: "Choose your preferred time slots that fit your schedule",
                color: "text-accent",
              },
              {
                icon: Award,
                title: "Certified Courses",
                desc: "Receive certificates upon successful completion of courses",
                color: "text-primary",
              },
            ].map((feature, index) => (
              <Card
                key={feature.title}
                className="text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="">
                  <feature.icon
                    className={`h-12 w-12 ${feature.color} mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
                  />
                  <CardTitle className="text-primary group-hover:text-secondary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="shadow-xl">
                  <p className="text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Our Courses</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive Quranic education programs designed for all levels
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                badge: "Beginner",
                title: "Quran Reading (Nazra)",
                desc: "Learn to read the Quran with proper pronunciation",
                price: "$30",
                badgeColor: "bg-primary",
                features: [
                  "Arabic alphabet and pronunciation",
                  "Tajweed rules",
                  "Reading practice",
                  "Individual attention",
                ],
              },
              {
                badge: "Intermediate",
                title: "Quran Translation",
                desc: "Understand the meaning of Quranic verses in English",
                price: "$40",
                badgeColor: "bg-secondary",
                features: [
                  "Word-by-word translation",
                  "Context understanding",
                  "Islamic history",
                  "Discussion sessions",
                ],
              },
              {
                badge: "Advanced",
                title: "Quran Memorization",
                desc: "Memorize the Holy Quran with expert guidance",
                price: "$50",
                badgeColor: "bg-accent",
                features: ["Systematic memorization", "Revision techniques", "Progress tracking", "Certification"],
              },
            ].map((course, index) => (
              <Card
                key={course.title}
                className="hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader>
                  <Badge className={`w-fit ${course.badgeColor} transition-all duration-300 group-hover:scale-110`}>
                    {course.badge}
                  </Badge>
                  <CardTitle className="text-primary group-hover:text-secondary transition-colors duration-300">
                    {course.title}
                  </CardTitle>
                  <CardDescription>{course.desc}</CardDescription>
                </CardHeader>
                <CardContent className="shadow-xl">
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    {course.features.map((feature, i) => (
                      <li key={i} className="transform transition-all duration-300 hover:translate-x-2">
                        • {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary group-hover:text-secondary transition-colors duration-300">
                      {course.price}/month
                    </span>
                    <Button className="bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-110 hover:shadow-lg">
                      Enroll Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Meet Our Qualified Teachers</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Learn from experienced Islamic scholars who are passionate about sharing the beauty of the Quran
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sheikh Abdullah Rahman",
                qualification: "PhD in Islamic Studies, Al-Azhar University",
                experience: "15+ years teaching experience",
                image: "/placeholder.svg?height=300&width=300",
                quote:
                  "The Quran is not just a book to be read, but a guide to be lived. Every verse contains wisdom that can transform hearts and minds. Teaching the Quran is my greatest honor.",
                specialty: "Quran Recitation & Tajweed",
              },
              {
                name: "Ustadha Fatima Al-Zahra",
                qualification: "Masters in Quranic Sciences, Islamic University of Medina",
                experience: "12+ years teaching experience",
                image: "/placeholder.svg?height=300&width=300",
                quote:
                  "Understanding the Quran in one's own language opens doors to spiritual enlightenment. I've witnessed countless students find peace and purpose through Quranic studies.",
                specialty: "Quran Translation & Tafseer",
              },
              {
                name: "Sheikh Muhammad Hassan",
                qualification: "Hafiz-e-Quran, Certified in Qira'at",
                experience: "20+ years teaching experience",
                image: "/placeholder.svg?height=300&width=300",
                quote:
                  "Memorizing the Quran is like planting seeds of divine guidance in your heart. Each verse becomes a companion that guides you through life's journey.",
                specialty: "Quran Memorization (Hifz)",
              },
            ].map((teacher, index) => (
              <Card
                key={teacher.name}
                className="hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up group overflow-hidden"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Image
                      src={teacher.image || "/placeholder.svg"}
                      alt={teacher.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-primary group-hover:text-secondary transition-colors duration-300 mb-1">
                        {teacher.name}
                      </h3>
                      <Badge className="bg-secondary/10 text-secondary hover:bg-secondary hover:text-white transition-all duration-300 mb-2">
                        {teacher.specialty}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-1">{teacher.qualification}</p>
                      <p className="text-sm text-primary font-semibold">{teacher.experience}</p>
                    </div>
                    <blockquote className="text-gray-700 italic text-center border-l-4 border-primary pl-4 group-hover:text-gray-900 transition-colors duration-300">
                      "{teacher.quote}"
                    </blockquote>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why Quranic Education is Important */}
          <div
            className="mt-16 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 animate-fade-in-up shadow-xl"
            style={{ animationDelay: "600ms" }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4">Why Quranic Education Matters</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "Spiritual Growth",
                  description: "Deepen your connection with Allah through understanding His words",
                  color: "text-primary",
                },
                {
                  icon: Users,
                  title: "Character Building",
                  description: "Develop moral values and ethical principles for daily life",
                  color: "text-secondary",
                },
                {
                  icon: Award,
                  title: "Inner Peace",
                  description: "Find tranquility and guidance in the divine teachings",
                  color: "text-accent",
                },
                {
                  icon: Clock,
                  title: "Lifelong Learning",
                  description: "Embark on a continuous journey of knowledge and wisdom",
                  color: "text-primary",
                },
              ].map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="text-center group animate-fade-in-up"
                  style={{ animationDelay: `${700 + index * 100}ms` }}
                >
                  <benefit.icon
                    className={`h-12 w-12 ${benefit.color} mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
                  />
                  <h4 className="font-semibold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">What Our Students Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Ahmed",
                location: "Student from USA",
                text: "The teachers are very patient and knowledgeable. I've learned so much about the Quran in just a few months.",
              },
              {
                name: "Muhammad Hassan",
                location: "Student from UK",
                text: "Excellent online platform with flexible timing. Perfect for working professionals like me.",
              },
              {
                name: "Fatima Khan",
                location: "Parent from Canada",
                text: "My children love their Quran classes. The teachers make learning fun and engaging.",
              },
            ].map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 animate-fade-in-up group shadow-xl"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-all duration-300 hover:scale-125"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 group-hover:text-gray-800 transition-colors duration-300">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-primary group-hover:text-secondary transition-colors duration-300">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">{testimonial.location}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Admission Form */}
      <section
        id="admission"
        className="py-20 relative overflow-hidden min-h-[600px]"
        style={{
          backgroundImage: `linear-gradient(rgba(19, 84, 71, 0.8), rgba(19, 84, 71, 0.6)), url('/images/mosque-interior.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#DAF1DE]/60 via-[#9EB69B]/40 to-[#DAF1DE]/60"></div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">Apply for Admission</h2>
                <p className="text-lg text-green-100 drop-shadow-md">
                  Start your Quranic learning journey today. Fill out the form below to get started.
                </p>
              </div>
              <Card
                className="bg-white/95 backdrop-blur-sm animate-fade-in-up transform transition-all duration-500 hover:shadow-2xl"
                style={{ animationDelay: "200ms" }}
              >
                <CardContent className="p-8">
                  <form className="grid md:grid-cols-2 gap-6">
                    {[
                      { id: "firstName", label: "First Name *", type: "text", placeholder: "Enter your first name" },
                      { id: "lastName", label: "Last Name *", type: "text", placeholder: "Enter your last name" },
                      { id: "email", label: "Email Address *", type: "email", placeholder: "Enter your email" },
                      { id: "phone", label: "Phone Number *", type: "tel", placeholder: "Enter your phone number" },
                      { id: "age", label: "Age", type: "number", placeholder: "Enter your age" },
                      { id: "country", label: "Country *", type: "text", placeholder: "Enter your country" },
                    ].map((field, index) => (
                      <div
                        key={field.id}
                        className="space-y-2 animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <Label htmlFor={field.id}>{field.label}</Label>
                        <Input
                          id={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                          required={field.label.includes("*")}
                          className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                        />
                      </div>
                    ))}
                    <div className="space-y-2 md:col-span-2 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                      <Label htmlFor="course">Preferred Course *</Label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md transition-all duration-300 focus:scale-105 focus:shadow-lg"
                        required
                      >
                        <option value="">Select a course</option>
                        <option value="nazra">Quran Reading (Nazra)</option>
                        <option value="translation">Quran Translation</option>
                        <option value="memorization">Quran Memorization</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
                      <Label htmlFor="experience">Previous Quranic Learning Experience</Label>
                      <Textarea
                        id="experience"
                        placeholder="Tell us about your previous experience with Quranic studies"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2 animate-fade-in-up" style={{ animationDelay: "800ms" }}>
                      <Label htmlFor="goals">Learning Goals</Label>
                      <Textarea
                        id="goals"
                        placeholder="What do you hope to achieve through this course?"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>
                    <div className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: "900ms" }}>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Contact Us</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions? We're here to help you start your Quranic learning journey.
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              { icon: Phone, title: "Phone", info: ["+1 (555) 123-4567", "+44 20 7123 4567"], color: "text-primary" },
              {
                icon: Mail,
                title: "Email",
                info: ["info@almursalaat.com", "admission@almursalaat.com"],
                color: "text-secondary",
              },
              {
                icon: MapPin,
                title: "Address",
                info: ["123 Islamic Center", "Education District"],
                color: "text-accent",
              },
            ].map((contact, index) => (
              <Card
                key={contact.title}
                className="text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-3 animate-fade-in-up group"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="pt-8">
                  <contact.icon
                    className={`h-12 w-12 ${contact.color} mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}
                  />
                  <h3 className="text-xl font-semibold text-primary mb-2 group-hover:text-secondary transition-colors duration-300">
                    {contact.title}
                  </h3>
                  {contact.info.map((info, i) => (
                    <p key={i} className="text-gray-600 group-hover:text-gray-800 transition-colors duration-300">
                      {info}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="animate-fade-in-up">
              <Image
                src="/images/logo-icon.png"
                alt="AL Mursalaat Academy"
                width={80}
                height={80}
                className="mb-4 transition-transform duration-300 hover:scale-110"
              />
              <p className="text-green-100 mb-4">
                Dedicated to providing quality online Quranic education to students worldwide.
              </p>
            </div>
            {[
              { title: "Quick Links", links: ["Home", "Courses", "About", "Admission"] },
              {
                title: "Courses",
                links: ["Quran Reading", "Quran Translation", "Quran Memorization", "Islamic Studies"],
              },
              {
                title: "Contact Info",
                links: ["+1 (555) 123-4567", "info@almursalaat.com", "123 Islamic Center", "Education District"],
              },
            ].map((section, index) => (
              <div
                key={section.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 150}ms` }}
              >
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-green-100">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      {section.title === "Quick Links" || section.title === "Courses" ? (
                        <Link
                          href="#"
                          className="hover:text-white transition-all duration-300 hover:translate-x-2 inline-block"
                        >
                          {link}
                        </Link>
                      ) : (
                        <span className="hover:text-white transition-colors duration-300">{link}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="border-t border-green-600 mt-8 pt-8 text-center text-green-100 animate-fade-in-up"
            style={{ animationDelay: "800ms" }}
          >
            <p>&copy; 2024 AL Mursalaat Online Islamic Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
