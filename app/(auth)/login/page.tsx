"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

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
          <span className="text-xl text-black">login</span>
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-[2.5rem] font-bold mb-2 text-[#1a1a1a]">Welcome back</h1>
        <p className="text-[#6b7280] text-xl mb-12">Log in to your account</p>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xl text-[#1a1a1a]">Email</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white text-[#1a1a1a] rounded-xl py-4 px-12 focus:outline-none border border-gray-200 placeholder-[#6b7280]"
                required
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-xl text-[#1a1a1a]">Password</label>
              <Link href="/forgot-password" className="text-[#6366F1] font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white text-[#1a1a1a] rounded-xl py-4 px-12 focus:outline-none border border-gray-200 placeholder-[#6b7280]"
                required
              />
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#6b7280" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366F1] text-white py-4 rounded-xl font-semibold mt-8 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <span className="text-[#6b7280]">Don't have an account? </span>
          <Link href="/signup" className="text-[#6366F1] font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
} 