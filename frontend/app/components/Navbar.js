'use client';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ username = "User" }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Temporary user data
 const userData = {
  username: username,
  fullName: `${username} Johnson`,
  email: `${username.toLowerCase()}@example.com`,
  phoneNumber: '+1 (555) 123-4567',
  age: 24,
  githubId: `${username.toLowerCase()}_dev`,
  leetcodeId: `${username.toLowerCase()}123`,
  location: 'San Francisco, CA',
  professionalSummary: 'Experienced Software Engineer with expertise in full-stack development, algorithms, and system design. Proven track record in building scalable web applications using modern technologies. Strong problem-solving skills with a passion for clean, efficient code and continuous learning. Currently focused on advanced data structures and competitive programming to enhance technical proficiency.',
  // ✅ Add these fields to avoid undefined
  joinDate: 'January 2021',
  bio: 'Passionate coder and lifelong learner. Enjoys solving problems and building meaningful tech that impacts real users.'
};


  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-lg font-sans">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <span className="text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-extrabold tracking-tight">
            LeetDash
          </span>
          <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-blue-100 to-purple-100 text-xs rounded-full text-blue-700 font-semibold border border-blue-200">
            BETA
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <a
            href="#"
            className="text-gray-800 hover:text-blue-600 transition-colors duration-200 font-medium text-sm relative group"
          >
            Dashboard
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium text-sm relative group"
          >
            Analytics
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium text-sm relative group"
          >
            Problems
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#"
            className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium text-sm relative group"
          >
            About
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        {/* User Profile Section */}
        <div className="relative" ref={dropdownRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Welcome back</p>
              <p className="text-xs text-gray-500">@{username}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300" title={`@${username}`}>
              <span>{username ? username.charAt(0).toUpperCase() : 'U'}</span>
            </div>
            {/* Dropdown Arrow */}
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-xl">
                    {userData.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{userData.fullName}</h3>
                    <p className="text-blue-100 text-sm">@{userData.username}</p>
                  </div>
                </div>
              </div>



              {/* User Details */}
              <div className="px-6 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">{userData.email}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{userData.location}</span>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">Joined {userData.joinDate}</span>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-600 leading-relaxed">{userData.bio}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                  View Full Profile
                </button>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm">
                    Settings
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}