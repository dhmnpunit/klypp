import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="mx-auto max-w-[480px] min-h-screen px-6 py-12 flex flex-col items-center">
        {/* App Icon - More rounded for iOS feel */}
        <div className="bg-[#1E1E1E] rounded-full p-4 mb-8 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9D5CFF" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>

        {/* App Title and Subtitle */}
        <h1 className="text-4xl font-bold mb-4 text-center">Klypp</h1>
        <p className="text-gray-400 text-xl mb-12 text-center">Manage subscriptions with your crew</p>

        {/* Feature List - Increased border radius for iOS feel */}
        <div className="w-full space-y-4 mb-12">
          {/* Create Plans */}
          <div className="bg-[#1E1E1E] p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="bg-[#2A2A2A] rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9D5CFF" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Create Plans</h2>
              <p className="text-gray-400">Add your subscription services</p>
            </div>
          </div>

          {/* Invite Friends */}
          <div className="bg-[#1E1E1E] p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="bg-[#2A2A2A] rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9D5CFF" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Invite Friends</h2>
              <p className="text-gray-400">Share costs with your crew</p>
            </div>
          </div>

          {/* Track Expenses */}
          <div className="bg-[#1E1E1E] p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="bg-[#2A2A2A] rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9D5CFF" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Track Expenses</h2>
              <p className="text-gray-400">Monitor your monthly spending</p>
            </div>
          </div>

          {/* Get Reminders */}
          <div className="bg-[#1E1E1E] p-4 rounded-2xl flex items-center space-x-4 shadow-sm">
            <div className="bg-[#2A2A2A] rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9D5CFF" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Get Reminders</h2>
              <p className="text-gray-400">Never miss a renewal date</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - More rounded corners and subtle shadow for iOS feel */}
        <Link href="/signup" className="block">
          <button className="w-full bg-[#9D5CFF] text-white py-4 rounded-2xl font-semibold mb-4 hover:bg-[#8A4EE8] transition-colors shadow-md">
            Get Started →
          </button>
        </Link>
        
        <Link href="/login" className="block">
          <button className="w-full bg-[#1E1E1E] text-white py-4 rounded-2xl font-semibold mb-4 hover:bg-[#2A2A2A] transition-colors shadow-md">
            Already have an account? Log in
          </button>
        </Link>

      </div>
    </main>
  );
}