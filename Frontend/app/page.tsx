"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Clock, Award, Phone, Mail, MapPin, Star } from "lucide-react"
import { useEffect, useState, FormEvent, useRef } from "react" // <-- Import useRef

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Counter Animation Hook (no changes)
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

// Intersection Observer Hook (no changes)
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
  // State for Counters (no changes)
  const [studentsRef, studentsInView] = useInView()
  const [teachersRef, teachersInView] = useInView()
  const [experienceRef, experienceInView] = useInView()
  const { count: studentsCount, setIsVisible: setStudentsVisible } = useCounter(500)
  const { count: teachersCount, setIsVisible: setTeachersVisible } = useCounter(50)
  const { count: experienceCount, setIsVisible: setExperienceVisible } = useCounter(10)
  useEffect(() => { if (studentsInView) setStudentsVisible(true) }, [studentsInView, setStudentsVisible])
  useEffect(() => { if (teachersInView) setTeachersVisible(true) }, [teachersInView, setTeachersVisible])
  useEffect(() => { if (experienceInView) setExperienceVisible(true) }, [experienceInView, setExperienceVisible])
  
  // State for Form Submission (no changes)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- NEW: Create a ref for the form element ---
  const formRef = useRef<HTMLFormElement>(null);


  // Form Submission Handler (with one change)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      if (value === '' && (key === 'age' || key === 'previous_experience' || key === 'learning_goals')) {
        data[key] = null;
      } else {
        data[key] = value;
      }
    });

    if (data.age) {
      data.age = parseInt(data.age, 10);
    }

    try {
      const response = await fetch('https://almursalaatonline.com/submit-application/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We will be in touch soon.' });
        // --- UPDATED: Reset the form using the ref ---
        formRef.current?.reset(); // The ?. safely calls reset only if the form exists
      } else {
        const errorMessage = result.detail || 'An unknown error occurred.';
        setMessage({ type: 'error', text: `Error: ${errorMessage}` });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({ type: 'error', text: 'Network Error: Could not connect to the server. Please try again later.' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header (No changes) */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50 backdrop-blur-sm bg-white/95 transition-all duration-300">
        {/* ... content ... */}
      </header>

      {/* Hero Section (No changes) */}
      <section id="home" className="py-20 relative overflow-hidden min-h-[600px]" style={{ /* ... */ }}>
        {/* ... content ... */}
      </section>

      {/* Other Sections (No changes) */}
      {/* ... */}

      {/* Admission Form Section (with one change) */}
      <section
        id="admission"
        className="py-20 relative overflow-hidden min-h-[600px]"
        style={{ /* ... */ }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#DAF1DE]/60 via-[#9EB69B]/40 to-[#DAF1DE]/60"></div>
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
                  {/* --- UPDATED: Attach the ref to the form element --- */}
                  <form ref={formRef} onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                    {/* Form fields (no changes) */}
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name *</Label>
                        <Input id="first_name" name="first_name" type="text" placeholder="Enter your first name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last_name">Last Name *</Label>
                        <Input id="last_name" name="last_name" type="text" placeholder="Enter your last name" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" name="email" type="email" placeholder="Enter your email" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number *</Label>
                        <Input id="phone_number" name="phone_number" type="tel" placeholder="Enter your phone number" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" name="age" type="number" placeholder="Enter your age" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input id="country" name="country" type="text" placeholder="Enter your country" required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="preferred_course">Preferred Course *</Label>
                      <select
                        id="preferred_course"
                        name="preferred_course"
                        className="w-full p-2 border border-gray-300 rounded-md transition-all duration-300 focus:scale-105 focus:shadow-lg"
                        required
                      >
                        <option value="">Select a course</option>
                        <option value="Quran Reading (Nazra)">Quran Reading (Nazra)</option>
                        <option value="Quran Translation">Quran Translation</option>
                        <option value="Quran Memorization">Quran Memorization</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="previous_experience">Previous Quranic Learning Experience</Label>
                      <Textarea
                        id="previous_experience"
                        name="previous_experience"
                        placeholder="Tell us about your previous experience with Quranic studies"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="learning_goals">Learning Goals</Label>
                      <Textarea
                        id="learning_goals"
                        name="learning_goals"
                        placeholder="What do you hope to achieve through this course?"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>

                    {/* Message Area (no changes) */}
                    {message && (
                      <div className="md:col-span-2">
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {message.text}
                        </div>
                      </div>
                    )}

                    {/* Submit Button (no changes) */}
                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Other Sections (No changes) */}
      <section id="contact" className="py-20 bg-gray-50">
        {/* ... content ... */}
      </section>
      <footer className="bg-primary text-white py-12">
        {/* ... content ... */}
      </footer>
    </div>
  )
}
