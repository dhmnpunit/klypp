"use client";

import Link from "next/link";

export default function SignUp() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-[480px] min-h-screen px-6 py-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-12">
          <Link href="/" className="inline-block">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <span className="text-xl text-black">signup</span>
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-[2.5rem] font-bold text-black mb-2">Create account</h1>
        <p className="text-[#6b7280] text-xl mb-12">Sign up to get started</p>

        {/* Sign Up Form */}
        <form className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xl text-black">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                className="w-full bg-white text-[#1a1a1a] rounded-2xl py-4 px-12 focus:outline-none border border-[#e5e7eb] placeholder-[#6b7280]"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
          </div>

          {/* Username Field */}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-xl text-black">Username</label>
            <div className="relative">
              <input
                type="text"
                id="username"
                placeholder="Choose a username"
                className="w-full bg-white text-[#1a1a1a] rounded-2xl py-4 px-12 focus:outline-none border border-[#e5e7eb] placeholder-[#6b7280]"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xl text-black">Password</label>
            <div className="relative">
              <input
                type="password"
                id="password"
                placeholder="Create a password"
                className="w-full bg-white text-[#1a1a1a] rounded-2xl py-4 px-12 focus:outline-none border border-[#e5e7eb] placeholder-[#6b7280]"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-xl text-black">Confirm Password</label>
            <div className="relative">
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                className="w-full bg-white text-[#1a1a1a] rounded-2xl py-4 px-12 focus:outline-none border border-[#e5e7eb] placeholder-[#6b7280]"
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-[#6366F1] text-white py-4 rounded-2xl font-semibold mt-8"
          >
            Create Account
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <span className="text-[#6b7280]">Already have an account? </span>
          <Link href="/login" className="text-[#6366F1] font-medium">
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
} 