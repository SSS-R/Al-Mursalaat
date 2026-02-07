"use client";

import Link from 'next/link';
import { Construction, MessageCircle, Mail, ArrowLeft } from 'lucide-react';

// Contact information constants
const WHATSAPP_NUMBER = "+8801601092024";

export default function TeacherApplyComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center max-w-2xl">
        <Construction className="mx-auto h-24 w-24 text-yellow-400 animate-pulse" />
        <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl">
          Recruitment Underway
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-300">
          Our teacher application form is currently on a spiritual retreat to find inner peace. It will be back soon, more enlightened and efficient than ever.
        </p>

        {/* Contact Section */}
        <div className="mt-10 p-6 bg-gray-800 rounded-xl">
          <h2 className="text-xl font-semibold text-white mb-4">
            Want to Apply as a Teacher?
          </h2>
          <p className="text-gray-300 mb-6">
            Contact us directly through any of these channels:
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* WhatsApp Button */}
            <a
              href="https://wa.me/8801805207677"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>

            {/* Facebook Button */}
            <a
              href="https://www.facebook.com/profile.php?id=61577710734719"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>

            {/* Email Button */}
            <a
              href="mailto:almursalaatonline@gmail.com"
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center"
            >
              <Mail className="h-5 w-5" />
              Email
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-400">
            Phone/WhatsApp: {WHATSAPP_NUMBER}
          </p>
        </div>

        {/* Return to Homepage */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
