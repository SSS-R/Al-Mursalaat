"use client"

import Image from "next/image"
import Link from "next/link"
import { BookOpen, Users, Clock, Award, Phone, Mail, MapPin, Star, ChevronDown, ChevronUp, X } from "lucide-react"
import { useEffect, useState, FormEvent, useRef } from "react" // Import useRef and FormEvent

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

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

// Terms and Conditions Modal Component (from your code)
function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const termsData = [
    {
      id: "general",
      title: "1. General Policy",
      content: [
        "By enrolling in any course at Al Mursalaat Online Islamic Academy, students and parents/guardians agree to follow all rules, regulations, and Islamic guidelines established by the institution.",
        "The academy upholds Islamic values, respectful communication, and discipline in all interactions.",
      ],
    },
    {
      id: "admission",
      title: "2. Admission Requirements",
      content: [
        "Proper Sitting Position: Students must sit at a reasonable distance from the device so their upper body, hands, and surrounding area are visible during class.",
        "Device & Internet: A stable internet connection and access to Zoom, Skype, or Google Meet via smartphone, tablet, or computer is required.",
        "Trial Class Completion: All students must attend a free trial class before final admission.",
        "Parental Supervision: For children under 10 years old, a parent or guardian should be available during class for assistance.",
        "Discipline & Attendance: Punctuality and regular attendance are mandatory. Repeated absences without notice may result in suspension.",
        "Homework & Practice: Students are expected to complete assignments and practice regularly.",
        "Behavior & Respect: Polite and respectful behavior towards teachers and fellow students is essential.",
        "Admission Form & Documents: A complete admission form along with necessary documents must be submitted before starting classes.",
        "Payment Policy: Tuition must be paid on time according to the selected monthly plan.",
      ],
    },
    {
      id: "attendance",
      title: "3. Attendance Policy",
      content: [
        "A minimum of 90% attendance is required to remain in good standing.",
        "In one-on-one classes, we kindly ask that any absence be communicated at least 6 hours in advance.",
        "Frequent rescheduling or absences without notice may affect continued enrollment or preferred time slots.",
      ],
    },
    {
      id: "dress",
      title: "4. Dress Code Policy",
      content: [
        "All students and teachers must adhere to Islamic dress guidelines during class.",
        "Clothing must cover the entire body, be loose-fitting, non-transparent, and modest.",
        "Male students and teachers should wear a clean jubbah or Islamic dress with a clean tupi.",
        "Tight or short pants are not permitted.",
        "Female students and teachers must wear a plain abaya or long dress with a large headscarf (Hijab).",
        "Makeup, including light makeup, is not allowed during class sessions.",
      ],
    },
    {
      id: "privacy",
      title: "5. Privacy Policy",
      content: [
        "For All Students:",
        "• Teachers are committed to maintaining the student's privacy.",
        "• No personal information may be requested or discussed.",
        "• Any inquiries beyond academic matters must be referred to academy authorities.",
        "• Only authorized academy staff may enter the virtual classroom.",
        "• Students are advised to have a plain wall or curtain behind them during class.",
        "",
        "Additional Guidelines for Female Teachers & Students:",
        "• Full privacy and proper veil (Hijab) of female teachers must be respected.",
        "• Female students above age 12 will be assigned female teachers only.",
        "• Male guardians are not allowed to assist female students in class.",
        "• Female guardians assisting students must observe proper Hijab and Islamic etiquette.",
        "• Parents must protect the teacher's privacy and not share personal information.",
      ],
    },
    {
      id: "conduct",
      title: "6. Code of Conduct",
      content: [
        "Respectful behavior, Islamic etiquette, and appropriate language must be maintained at all times.",
        "Disrespect towards instructors, students, or the academy may lead to disciplinary action.",
        "Students must be mentally present, focused, and cooperative during sessions.",
      ],
    },
    {
      id: "fees",
      title: "7. Fees & Payments",
      content: [
        "Course fees must be paid on the agreed date each month.",
        "Refunds are not available unless a class is cancelled by the academy.",
        "Failure to make timely payments may result in class access being paused.",
      ],
    },
    {
      id: "certification",
      title: "8. Certification",
      content: [
        "Certificates of completion will be awarded to students who meet attendance and course requirements.",
        "Certificates will be provided in digital format unless otherwise arranged.",
      ],
    },
    {
      id: "amendments",
      title: "9. Amendments",
      content: [
        "The academy reserves the right to update these Terms & Conditions at any time with appropriate notice to students and parents.",
      ],
    },
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">Al Mursalaat Online Islamic Academy Terms & Conditions</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <p className="text-sm text-gray-600 mb-6">Effective from January 1, 2024</p>
          <div className="space-y-4">
            {termsData.map((section) => (
              <div key={section.id} className="border rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-semibold text-primary">{section.title}</h3>
                  {expandedSections[section.id] ? (
                    <ChevronUp className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedSections[section.id] && (
                  <div className="px-4 pb-4">
                    <div className="space-y-2">
                      {section.content.map((item, index) => (
                        <p key={index} className="text-sm text-gray-700 leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">Contact Information:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Email: almursalaatonline@gmail.com</p>
              <p>WhatsApp: +8801601092024</p>
              <p>Facebook: Al Mursalaat Online Islamic Academy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
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
  
  // --- NEW: State for Form and Modal ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false)
  const formRef = useRef<HTMLFormElement>(null);

  // --- NEW: Form Submission Handler ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const data: { [key: string]: any } = {};
    formData.forEach((value, key) => {
      // Convert empty strings for optional fields to null
      if (value === '' && (key === 'age' || key === 'previous_experience' || key === 'learning_goals' || key === 'whatsapp_number')) {
        data[key] = null;
      } else {
        data[key] = value;
      }
    });
    if (data.age) data.age = parseInt(data.age, 10);

    try {
      const response = await fetch('https://almursalaatonline.com/submit-application/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: 'Application submitted successfully! We will be in touch soon.' });
        formRef.current?.reset();
        setHasAgreedToTerms(false); // Reset checkbox
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
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="#home" className="flex items-center space-x-4 animate-fade-in">
              <Image
                src="/images/logo-icon.png"
                alt="AL Mursalaat Online Islamic Academy"
                width={600}
                height={300}
                className="h-16 w-auto transition-transform duration-600 hover:scale-105 cursor-pointer"
              />
            </Link>
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
            <Link href="#admission">
              <Button className="bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-bounce-subtle">
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section and other sections (no changes) */}
      {/* ... */}
       <section id="home" className="py-20 relative overflow-hidden min-h-[600px]" style={{ backgroundImage: `linear-gradient(rgba(19, 84, 71, 0.8), rgba(19, 84, 71, 0.6)), url('/images/mosque-interior.jpg')`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed" }}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#DAF1DE]/60 via-[#9EB69B]/40 to-[#DAF1DE]/60"></div>
        <div className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white animate-slide-in-left">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up drop-shadow-lg">Learn Al-Quran in English Online</h1>
                <p className="text-xl mb-8 text-green-100 animate-fade-in-up drop-shadow-md" style={{ animationDelay: "200ms" }}>
                  Join AL Mursalaat Online Islamic Academy and embark on a spiritual journey to understand the Holy Quran with expert guidance and personalized learning.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
                  <Link href="#admission">
                    <Button size="lg" className="bg-secondary hover:bg-secondary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">Start Your Journey</Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary bg-white/10 backdrop-blur-sm transform transition-all duration-300 hover:scale-105">Watch Demo</Button>
                </div>
                <div className="mt-8 flex items-center space-x-6 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
                  <div className="text-center transform transition-all duration-300 hover:scale-110" ref={studentsRef}>
                    <div className="text-2xl font-bold drop-shadow-lg">{studentsCount}+</div>
                    <div className="text-sm text-green-200">Students</div>
                  </div>
                  <div className="text-center transform transition-all duration-300 hover:scale-110" ref={teachersRef}>
                    <div className="text-2xl font-bold drop-shadow-lg">{teachersCount}+</div>
                    <div className="text-sm text-green-200">Qualified Teachers</div>
                  </div>
                  <div className="text-center transform transition-all duration-300 hover:scale-110" ref={experienceRef}>
                    <div className="text-2xl font-bold drop-shadow-lg">{experienceCount}+</div>
                    <div className="text-sm text-green-200">Years Experience</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center animate-slide-in-right">
                <div className="relative">
                  <div className="absolute inset-0 backdrop-blur-sm rounded-full scale-110 bg-white opacity-0"></div>
                  <Image src="/images/logo-full.png" alt="AL Mursalaat Academy Logo" width={400} height={400} className="w-full max-w-md animate-float relative z-10 drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">{/* ... Features Section ... */}</section>
      <section id="courses" className="py-20 bg-white">{/* ... Courses Section ... */}</section>
      <section className="py-20 bg-white">{/* ... Teachers Section ... */}</section>
      <section className="py-20 bg-white">{/* ... Testimonials Section ... */}</section>

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
                  {/* Attach the ref and the handleSubmit function */}
                  <form ref={formRef} onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                    
                    {/* --- UPDATED: Add 'name' attributes to match backend schema --- */}
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input id="first_name" name="first_name" type="text" placeholder="Enter your first name" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input id="last_name" name="last_name" type="text" placeholder="Enter your last name" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select id="gender" name="gender" required className="w-full p-2 border border-gray-300 rounded-md transition-all duration-300 focus:scale-105 focus:shadow-lg">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input id="age" name="age" type="number" placeholder="Enter your age" className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="parent_name">Parent's Name *</Label>
                      <Input id="parent_name" name="parent_name" type="text" placeholder="If self, type 'self'" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship with Student *</Label>
                      <Input id="relationship" name="relationship" type="text" placeholder="If self, type 'self'" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" name="email" type="email" placeholder="Enter your email" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input id="phone_number" name="phone_number" type="tel" placeholder="Enter your phone number" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                      <Input id="whatsapp_number" name="whatsapp_number" type="tel" placeholder="Optional, if different" className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" name="country" type="text" placeholder="Enter your country" required className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="preferred_course">Preferred Course *</Label>
                      <select id="preferred_course" name="preferred_course" required className="w-full p-2 border border-gray-300 rounded-md transition-all duration-300 focus:scale-105 focus:shadow-lg">
                        <option value="">Select a course</option>
                        <option value="Quran Learning (Kayda)">Quran Learning (Kayda)</option>
                        <option value="Quran Reading (Nazra)">Quran Reading (Nazra)</option>
                        <option value="Quran Translation">Quran Translation</option>
                        <option value="Quran Memorization">Quran Memorization</option>
                      </select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="previous_experience">Previous Quranic Learning Experience</Label>
                      <Textarea id="previous_experience" name="previous_experience" placeholder="Tell us about your previous experience" className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="learning_goals">Learning Goals</Label>
                      <Textarea id="learning_goals" name="learning_goals" placeholder="What do you hope to achieve?" className="transition-all duration-300 focus:scale-105 focus:shadow-lg" />
                    </div>

                    {/* Terms and Conditions Checkbox */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="terms"
                          checked={hasAgreedToTerms}
                          onCheckedChange={(checked) => setHasAgreedToTerms(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm">
                          I have read and agree to the{" "}
                          <button
                            type="button"
                            onClick={() => setIsTermsModalOpen(true)}
                            className="text-primary hover:text-secondary underline font-medium"
                          >
                            Terms and Conditions
                          </button>
                        </Label>
                      </div>
                    </div>

                    {/* Message Area for Feedback */}
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
                        disabled={!hasAgreedToTerms || isSubmitting}
                        className="w-full bg-primary hover:bg-primary/90 transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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

      {/* Contact and Footer sections (no changes) */}
      <section id="contact" className="py-20 bg-gray-50">{/* ... */}</section>
      <footer className="bg-primary text-white py-12">{/* ... */}</footer>

      {/* Terms and Conditions Modal */}
      <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />
    </div>
  )
}
