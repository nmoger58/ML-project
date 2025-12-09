import { useState } from 'react';
import { User, Trophy, Zap, Eye, Code, Calendar, TrendingUp, Search } from 'lucide-react';

export default function LeetCodeDashboard() {
  const [username, setUsername] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setProfileData(null);

      const profileResponse = await fetch(`http://localhost:3003/leetcode/${username.trim()}`);
      
      if (!profileResponse.ok) {
        throw new Error(`HTTP error! status: ${profileResponse.status}`);
      }
      
      const profileResult = await profileResponse.json();
      
      if (profileResult && profileResult.status && profileResult.data) {
        setProfileData(profileResult.data);
      } else if (profileResult.error) {
        throw new Error(profileResult.error);
      } else {
        throw new Error('Invalid data structure received from API');
      }
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchData();
    }
  };

  // Input Form Screen
  if (!profileData && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">LeetCode Dashboard</h1>
              <p className="text-gray-600">View detailed profile statistics</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  LeetCode Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="e.g., lucifer58"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                  <Search className="absolute right-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'View Profile'}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Try: lucifer58 or any LeetCode username</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading @{username}...</p>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-white py-8 font-sans">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                LeetCode Profile Dashboard
              </h1>
              <p className="text-xl opacity-90">@{profileData.username}</p>
            </div>
            <button
              onClick={() => {
                setProfileData(null);
                setUsername('');
                setError(null);
              }}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              New Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {profileData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 mb-8">
              {profileData.image && (
                <div className="relative">
                  <img 
                    src={profileData.image} 
                    alt={profileData.name || profileData.username}
                    className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg"
                  />
                  {profileData.rank && (
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                      #{profileData.rank}
                    </div>
                  )}
                </div>
              )}
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {profileData.name || profileData.username}
                </h2>
                <p className="text-gray-600 mb-4 text-lg flex items-center justify-center md:justify-start">
                  <User className="h-5 w-5 mr-2" />
                  @{profileData.username}
                </p>
                {profileData.languages && profileData.languages.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-3">
                    {profileData.languages.map((lang, index) => (
                      <span 
                        key={index} 
                        className="px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:shadow-md transition-all duration-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                title="Total Solved" 
                value={profileData.totalSolved || '0'}
                color="blue"
                icon={<Code className="h-6 w-6" />}
              />
              <StatCard 
                title="Easy Solved" 
                value={profileData.easySolved || '0'}
                color="green"
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <StatCard 
                title="Medium Solved" 
                value={profileData.mediumSolved || '0'}
                color="purple"
                icon={<Zap className="h-6 w-6" />}
              />
              <StatCard 
                title="Hard Solved" 
                value={profileData.hardSolved || '0'}
                color="orange"
                icon={<Trophy className="h-6 w-6" />}
              />
            </div>

            {profileData.badges && profileData.badges.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-2 mr-3">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Badges
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {profileData.badges.map((badge, index) => (
                    <div 
                      key={index} 
                      className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer text-center"
                    >
                      {badge.icon && (
                        <img src={badge.icon} alt={badge.name} className="w-12 h-12 mx-auto mb-2" />
                      )}
                      <span className="text-gray-700 text-sm font-medium">
                        {badge.name || badge.displayName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profileData.recentSubmissions && profileData.recentSubmissions.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-2 mr-3">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Recent Submissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profileData.recentSubmissions.map((submission, index) => (
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
                        {submission.title}
                      </h4>
                      <p className="text-gray-500 text-sm flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {submission.date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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