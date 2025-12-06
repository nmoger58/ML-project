'use client';

import { useState, useEffect } from 'react';
import { User, Trophy, Zap, Eye, Code, Calendar, TrendingUp } from 'lucide-react';

export default function LeetCodeDashboard() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileResponse = await fetch('http://localhost:3001/api/user/profile/n07kiran');
        console.log('Profile response:', profileResponse.data);
        if (!profileResponse.ok) {
          throw new Error(`HTTP error! status: ${profileResponse.status}`);
        }
        
        const contentType = profileResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await profileResponse.text();
          throw new Error(`Expected JSON but received: ${contentType}. Response: ${text.substring(0, 100)}...`);
        }
        
        const profileResult = await profileResponse.json();
        console.log(profileResult);
        if (profileResult && profileResult.data && profileResult.data.data) {
          setProfileData(profileResult.data.data);
        } else {
          throw new Error('Invalid data structure received from API');
        }
        
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to fetch data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading LeetCode data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md shadow-lg">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-red-800 text-xl font-bold">Error Loading Data</h2>
          </div>
          <p className="text-red-700 leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            LeetCode Profile Dashboard
          </h1>
          <p className="text-xl opacity-90">Comprehensive profile overview and statistics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Section */}
        {profileData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 mb-8">
              <div className="relative">
                <img 
                  src={profileData.image} 
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg"
                />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  #{profileData.rank}
                </div>
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{profileData.name}</h2>
                <p className="text-gray-600 mb-4 text-lg flex items-center justify-center md:justify-start">
                  <User className="h-5 w-5 mr-2" />
                  @{profileData.username}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {profileData.languages && profileData.languages.map((lang, index) => (
                    <span 
                      key={index} 
                      className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Questions Solved" 
                value={profileData.totalQuestions}
                color="blue"
                icon={<Code className="h-6 w-6" />}
              />
              <StatCard 
                title="Submissions" 
                value={profileData.submissions}
                color="green"
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <StatCard 
                title="Streak" 
                value={profileData.streak}
                color="purple"
                icon={<Zap className="h-6 w-6" />}
              />
              <StatCard 
                title="Profile Views" 
                value={profileData.views}
                color="orange"
                icon={<Eye className="h-6 w-6" />}
              />
            </div>

            {/* Skills Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 mr-3">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                Top Skills
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profileData.skills && profileData.skills.slice(0, 8).map((skill, index) => (
                  <div 
                    key={index} 
                    className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 group-hover:bg-purple-500 transition-colors duration-300"></div>
                      <span className="text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-300">
                        {skill}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            {profileData?.recentSolved && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 mr-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Recent Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.recentSolved.slice(0, 6).map((problem, index) => {
                    const [title, date] = problem.split('\n');
                    return (
                      <div 
                        key={index} 
                        className="group p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0 mt-1 group-hover:bg-blue-500 transition-colors duration-300"></div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            Recent
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                          {title}
                        </h4>
                        <p className="text-gray-500 text-sm flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {date}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced stat card component with white theme
function StatCard({ title, value, color, icon }) {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-700',
      icon: 'text-orange-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`group p-6 rounded-2xl border ${classes.bg} ${classes.border} hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${classes.icon} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-gray-800 group-hover:scale-105 transition-transform duration-300">
            {value}
          </p>
        </div>
      </div>
      <h3 className={`font-semibold ${classes.text} group-hover:text-opacity-80 transition-all duration-300`}>
        {title}
      </h3>
    </div>
  );
}