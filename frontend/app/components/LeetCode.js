import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import { TrendingUp, Target, BookOpen, Award, Clock, CheckCircle, AlertTriangle, ExternalLink, Search, User, Trophy, Zap, Code, Calendar, BarChart3, Star, Activity } from 'lucide-react';

export default function CombinedLeetCodeDashboard() {
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
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
      setAnalysisData(null);

      const [profileResponse, analysisResponse] = await Promise.all([
        fetch(`http://localhost:3003/leetcode/${username.trim()}`),
        fetch(`http://127.0.0.1:3002/analyze/${username.trim()}`)
      ]);

      if (profileResponse.ok) {
        const profileResult = await profileResponse.json();
        if (profileResult.status && profileResult.data) {
          setProfileData(profileResult.data);
        }
      }

      if (analysisResponse.ok) {
        const analysisResult = await analysisResponse.json();
        if (analysisResult.status && analysisResult.data) {
          setAnalysisData(analysisResult.data);
        }
      }

      if (!profileData && !analysisData) {
        throw new Error('Failed to fetch data. Please check if the username exists.');
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

  const resetSearch = () => {
    setProfileData(null);
    setAnalysisData(null);
    setUsername('');
    setError(null);
    setActiveTab('profile');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!profileData && !analysisData && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">LeetCode Analytics</h1>
              <p className="text-gray-600">Complete Profile & Performance Analysis</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
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
                    placeholder="e.g., Ani_Pai"
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
                Analyze Profile
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 mb-4">Try: Ani_Pai, lucifer58, n07kiran</p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Profile Stats
                </div>
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  AI Analysis
                </div>
              </div>
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
          <p className="text-gray-600 text-lg">Analyzing @{username}...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching comprehensive data</p>
        </div>
      </div>
    );
  }

  // Prepare analysis chart data
  const topicData = analysisData ? Object.entries(analysisData.topic_proficiency || {}).map(([topic, proficiency]) => ({
    topic,
    proficiency: (proficiency * 100).toFixed(1),
  })) : [];

  // Difficulty distribution for pie chart
  const difficultyDistribution = profileData?.solvedProblems ? [
    { name: 'Easy', value: profileData.solvedProblems.easy, color: '#10B981' },
    { name: 'Medium', value: profileData.solvedProblems.medium, color: '#F59E0B' },
    { name: 'Hard', value: profileData.solvedProblems.hard, color: '#EF4444' }
  ] : [];

  // Radial chart data for solved problems
  const radialData = profileData?.solvedProblems ? [
    { name: 'Easy', value: profileData.solvedProblems.easy, fill: '#10B981' },
    { name: 'Medium', value: profileData.solvedProblems.medium, fill: '#F59E0B' },
    { name: 'Hard', value: profileData.solvedProblems.hard, fill: '#EF4444' }
  ] : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">LeetCode Analytics</h1>
              <p className="text-xl opacity-90">@{username}</p>
              {profileData?.rank && (
                <div className="flex items-center gap-4 mt-2">
                  <p className="text-lg opacity-75">Global Rank: #{profileData.rank.toLocaleString()}</p>
                  {profileData.reputation !== undefined && (
                    <p className="text-lg opacity-75">Reputation: {profileData.reputation}</p>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={resetSearch}
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              New Search
            </button>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              <User className="inline h-5 w-5 mr-2" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'analysis'
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 text-white hover:bg-blue-800'
              }`}
            >
              <BarChart3 className="inline h-5 w-5 mr-2" />
              Analysis
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'profile' && profileData && (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8 mb-8">
                {profileData.image && (
                  <div className="relative">
                    <img 
                      src={profileData.image} 
                      alt={profileData.name}
                      className="w-32 h-32 rounded-full border-4 border-blue-200 shadow-lg object-cover"
                    />
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
                      #{profileData.rank.toLocaleString()}
                    </div>
                  </div>
                )}
                
                <div className="text-center md:text-left flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {profileData.name || profileData.username}
                  </h2>
                  <p className="text-gray-600 mb-2 text-lg flex items-center justify-center md:justify-start">
                    <User className="h-5 w-5 mr-2" />
                    @{profileData.username}
                  </p>
                  {profileData.reputation !== undefined && (
                    <p className="text-gray-500 flex items-center justify-center md:justify-start">
                      <Star className="h-4 w-4 mr-1 text-yellow-500" />
                      {profileData.reputation} Reputation
                    </p>
                  )}
                </div>
              </div>

              {/* Main Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                  title="Total Solved" 
                  value={profileData.totalSolved || 0}
                  color="blue"
                  icon={<Code className="h-6 w-6" />}
                />
                <StatCard 
                  title="Easy Problems" 
                  value={profileData.easySolved || 0}
                  color="green"
                  icon={<CheckCircle className="h-6 w-6" />}
                />
                <StatCard 
                  title="Medium Problems" 
                  value={profileData.mediumSolved || 0}
                  color="purple"
                  icon={<TrendingUp className="h-6 w-6" />}
                />
                <StatCard 
                  title="Hard Problems" 
                  value={profileData.hardSolved || 0}
                  color="orange"
                  icon={<Trophy className="h-6 w-6" />}
                />
              </div>

              {/* Problem Distribution Charts */}
              {difficultyDistribution.length > 0 && (
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-blue-600" />
                      Difficulty Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={difficultyDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {difficultyDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Progress Overview
                    </h3>
                    <div className="space-y-4">
                      <ProgressBar 
                        label="Easy" 
                        value={profileData.easySolved} 
                        total={profileData.totalSolved}
                        color="bg-green-500"
                      />
                      <ProgressBar 
                        label="Medium" 
                        value={profileData.mediumSolved} 
                        total={profileData.totalSolved}
                        color="bg-yellow-500"
                      />
                      <ProgressBar 
                        label="Hard" 
                        value={profileData.hardSolved} 
                        total={profileData.totalSolved}
                        color="bg-red-500"
                      />
                      <div className="pt-4 border-t border-green-200">
                        <p className="text-sm text-gray-600">
                          Total Problems Solved: <span className="font-bold text-gray-800">{profileData.totalSolved}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            {profileData.badges && profileData.badges.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-3 text-purple-600" />
                  Earned Badges ({profileData.badges.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {profileData.badges.map((badge, index) => (
                    <div 
                      key={index} 
                      className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-lg transition-all text-center group"
                    >
                      {badge.icon && (
                        <img 
                          src={badge.icon} 
                          alt={badge.name} 
                          className="w-16 h-16 mx-auto mb-3 group-hover:scale-110 transition-transform"
                        />
                      )}
                      <span className="text-gray-700 text-xs font-medium block">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Submissions */}
            {profileData.recentSubmissions && profileData.recentSubmissions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <Calendar className="h-6 w-6 mr-3 text-green-600" />
                  Recent Submissions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profileData.recentSubmissions.map((submission, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full mt-1"></div>
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          Accepted
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2 leading-tight">
                        {submission.title}
                      </h4>
                      <p className="text-gray-600 text-sm flex items-center">
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

        {activeTab === 'analysis' && analysisData && (
          <div className="space-y-8">
            {/* Performance Score */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Performance Score</h2>
                  <p className="text-indigo-100">AI-calculated proficiency level</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm opacity-75">Rank: #{analysisData.rank}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-bold mb-2">
                    {analysisData.performance_score?.toFixed(1) || 0}
                  </div>
                  <div className="flex items-center justify-end">
                    <TrendingUp className="h-6 w-6 mr-2" />
                    <span className="text-lg">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Proficiency */}
            {topicData.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-blue-600" />
                  Topic Proficiency Analysis
                </h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topicData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="topic" angle={-45} textAnchor="end" height={100} stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar dataKey="proficiency" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Weak Areas */}
            {analysisData.weak_areas && analysisData.weak_areas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
                  Areas for Improvement
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {analysisData.weak_areas.map((area, index) => (
                    <div key={index} className="flex items-center p-4 bg-red-50 rounded-lg border border-red-100">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                      <span className="font-medium text-red-800 flex-1">{area}</span>
                      <span className="text-sm text-red-600 font-semibold">
                        {((analysisData.topic_proficiency?.[area] || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Problems */}
            {analysisData.suggested_problems && analysisData.suggested_problems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
                  Recommended Problems
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysisData.suggested_problems.map((problem, index) => (
                    <div key={index} className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-lg hover:border-blue-300 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 leading-tight flex-1">
                          {problem.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ml-2 ${getDifficultyColor(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                      </div>
                      <a 
                        href={problem.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Solve Problem
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvement Roadmap */}
            {analysisData.improvement_roadmap && analysisData.improvement_roadmap.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <Clock className="h-6 w-6 mr-3 text-purple-600" />
                  Improvement Roadmap
                </h3>
                <div className="space-y-4">
                  {analysisData.improvement_roadmap.map((item, index) => {
                    const isPhase = item.includes('Phase');
                    const isTarget = item.trim().startsWith('Target:');
                    
                    if (isPhase) {
                      return (
                        <div key={index} className="flex items-start p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-l-4 border-purple-500">
                          <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <h4 className="text-lg font-bold text-purple-800 flex-1">{item}</h4>
                        </div>
                      );
                    } else if (isTarget) {
                      return (
                        <div key={index} className="ml-14 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start">
                            <Target className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                            <p className="text-blue-800 font-medium">{item.trim()}</p>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className="ml-14 p-3 bg-gray-50 rounded-lg">
                          <p className="text-gray-700 italic">{item.trim()}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisData.recommendations && analysisData.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                  <Award className="h-6 w-6 mr-3 text-green-600" />
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {analysisData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg border border-green-100 hover:shadow-md transition-shadow">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-green-800 leading-relaxed">{recommendation}</p>
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
    blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
    green: { bg: 'bg-gradient-to-br from-green-50 to-green-100', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
    purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
    orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' }
  };

  const classes = colorClasses[color];

  return (
    <div className={`p-6 rounded-2xl border ${classes.bg} ${classes.border} hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer`}>
      <div className="flex items-center justify-between mb-4">
        <div className={classes.icon}>{icon}</div>
        <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
      <h3 className={`font-semibold ${classes.text}`}>{title}</h3>
    </div>
  );
}

function ProgressBar({ label, value, total, color }) {
  const percentage = Math.round((value / total) * 100);
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{value} ({percentage}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}