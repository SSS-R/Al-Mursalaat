"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Clock, Award, Phone, Mail, MapPin, Star } from "lucide-react"
import { useEffect, useState, FormEvent } from "react" // <-- Import FormEvent

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Counter Animation Hook (no changes needed here)
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

// Intersection Observer Hook (no changes needed here)
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
  // --- State for Counters (no changes needed) ---
  const [studentsRef, studentsInView] = useInView()
  const [teachersRef, teachersInView] = useInView()
  const [experienceRef, experienceInView] = useInView()
  const { count: studentsCount, setIsVisible: setStudentsVisible } = useCounter(500)
  const { count: teachersCount, setIsVisible: setTeachersVisible } = useCounter(50)
  const { count: experienceCount, setIsVisible: setExperienceVisible } = useCounter(10)
  useEffect(() => { if (studentsInView) setStudentsVisible(true) }, [studentsInView, setStudentsVisible])
  useEffect(() => { if (teachersInView) setTeachersVisible(true) }, [teachersInView, setTeachersVisible])
  useEffect(() => { if (experienceInView) setExperienceVisible(true) }, [experienceInView, setExperienceVisible])
  
  // --- NEW: State for Form Submission ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  // --- NEW: Form Submission Handler ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    // 1. Prevent the default form submission which reloads the page
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // 2. Create a FormData object from the form
    const formData = new FormData(event.currentTarget);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      // Convert empty strings for optional fields to null
      if (value === '' && (key === 'age' || key === 'previous_experience' || key === 'learning_goals')) {
        data[key] = null;
      } else {
        data[key] = value;
      }
    });

    // Ensure 'age' is a number if it exists
    if (data.age) {
      data.age = parseInt(data.age, 10);
    }

    try {
      // 3. Send the data to your backend API
      const response = await fetch('https://almursalaatonline.com/submit-application/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      // 4. Handle the response from the server
      if (response.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We will be in touch soon.' });
        event.currentTarget.reset(); // Clear the form
      } else {
        // Handle errors like "email already exists"
        const errorMessage = result.detail || 'An unknown error occurred.';
        setMessage({ type: 'error', text: `Error: ${errorMessage}` });
      }
    } catch (error) {
      // Handle network errors
      console.error('Submission error:', error);
      setMessage({ type: 'error', text: 'Network Error: Could not connect to the server. Please try again later.' });
    } finally {
      // 5. Re-enable the button
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header (No changes needed) */}
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

      {/* Hero Section (No changes needed) */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-[#DAF1DE]/60 via-[#9EB69B]/40 to-[#DAF1DE]/60"></div>
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

      {/* Other Sections (Features, Courses, Teachers, Testimonials) - No changes needed */}
      <section className="py-20 bg-white">
        {/* ... content ... */}
      </section>
      <section id="courses" className="py-20 bg-white">
        {/* ... content ... */}
      </section>
      <section className="py-20 bg-white">
        {/* ... content ... */}
      </section>
      <section className="py-20 bg-white">
        {/* ... content ... */}
      </section>

      {/* --- UPDATED Admission Form Section --- */}
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
                  {/* Attach the handleSubmit function to the form's onSubmit event */}
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                    {/* --- UPDATED: Add 'name' attributes to match backend schema --- */}
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
                        name="preferred_course" // Added name attribute
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
                        name="previous_experience" // Added name attribute
                        placeholder="Tell us about your previous experience with Quranic studies"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="learning_goals">Learning Goals</Label>
                      <Textarea
                        id="learning_goals"
                        name="learning_goals" // Added name attribute
                        placeholder="What do you hope to achieve through this course?"
                        className="transition-all duration-300 focus:scale-105 focus:shadow-lg"
                      />
                    </div>

                    {/* --- NEW: Message Area for Feedback --- */}
                    {message && (
                      <div className="md:col-span-2">
                        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {message.text}
                        </div>
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        disabled={isSubmitting} // Disable button while submitting
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

      {/* Contact Section (No changes needed) */}
      <section id="contact" className="py-20 bg-gray-50">
        {/* ... content ... */}
      </section>

      {/* Footer (No changes needed) */}
      <footer className="bg-primary text-white py-12">
        {/* ... content ... */}
      </footer>
    </div>
  )
}
