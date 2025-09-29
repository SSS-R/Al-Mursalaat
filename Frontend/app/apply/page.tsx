"use client";

import Link from 'next/link';
import { Construction } from 'lucide-react';

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
        <div className="mt-10">
          <Link
            href="/"
            className="rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
