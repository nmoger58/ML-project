import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, BookOpen, Award, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

const LeetCodeAnalyzer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:3002/analyze/n07kiran');
        const result = await response.json();
        console.log('API Response:', result.data);
        // Check if the response has the expected structure
        if (result.status && result.data) {
          setData(result.data);
        } else if (result.error) {
          setError(result.error);
        } else {
          setError('Invalid response format');
        }
      } catch (err) {
        setError('Failed to fetch data');
        console.error('Error fetching data:', err);
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
          <p className="text-gray-600 text-lg">Loading your LeetCode analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-600">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
          <p className="text-xl">No data available</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const topicData = Object.entries(data.topic_proficiency).map(([topic, proficiency]) => ({
    topic,
    proficiency: (proficiency * 100).toFixed(1),
    color: proficiency >= 0.8 ? '#10B981' : proficiency >= 0.5 ? '#F59E0B' : '#EF4444'
  }));

  const difficultyData = data.suggested_problems.reduce((acc, problem) => {
    acc[problem.difficulty] = (acc[problem.difficulty] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(difficultyData).map(([difficulty, count]) => ({
    name: difficulty,
    value: count,
    color: difficulty === 'Easy' ? '#10B981' : difficulty === 'Medium' ? '#F59E0B' : '#EF4444'
  }));

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">LeetCode Profile Analysis</h1>
          <p className="text-xl opacity-90">@{data.username}</p>
          {data.rank && (
            <p className="text-lg opacity-75">Rank: #{data.rank}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Performance Score Card */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Performance Score</h2>
              <p className="text-indigo-100">Your current coding proficiency level</p>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-2">{data.performance_score.toFixed(1)}</div>
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                <span>Growing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Proficiency Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <BarChart className="h-6 w-6 mr-3 text-blue-600" />
            Topic Proficiency Analysis
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="topic" 
                  angle={-45} 
                  textAnchor="end" 
                  height={100}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Bar dataKey="proficiency" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weak Areas and Suggested Problems */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Weak Areas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-3 text-red-500" />
              Areas for Improvement
            </h3>
            <div className="space-y-3">
              {data.weak_areas.map((area, index) => (
                <div key={index} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <span className="font-medium text-red-800">{area}</span>
                  <span className="ml-auto text-sm text-red-600">
                    {(data.topic_proficiency[area] * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Difficulty Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
              <Target className="h-6 w-6 mr-3 text-green-500" />
              Suggested Problems
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recommended Problems */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <BookOpen className="h-6 w-6 mr-3 text-blue-600" />
            Recommended Problems
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.suggested_problems.map((problem, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 leading-tight">{problem.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
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

        {/* Improvement Roadmap */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Clock className="h-6 w-6 mr-3 text-purple-600" />
            Improvement Roadmap
          </h3>
          <div className="space-y-6">
            {data.improvement_roadmap.map((item, index) => {
              const isPhaseHeader = item.includes('Phase') || item.includes('Long-term');
              const isTarget = item.trim().startsWith('Target:') || item.trim().startsWith('Goal:') || item.trim().startsWith('Consider:');
              
              if (isPhaseHeader) {
                return (
                  <div key={index} className="relative">
                    <div className="flex items-start p-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-l-4 border-purple-500">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-sm">
                          {item.includes('Phase 1') ? '1' : 
                           item.includes('Phase 2') ? '2' : 
                           item.includes('Phase 3') ? '3' : 
                           item.includes('Phase 4') ? '4' : '★'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-purple-800 mb-1">
                          {item.replace(/^[🎯🔍🏆🎪🌟🚀]\s*/, '')}
                        </h4>
                        <div className="w-full bg-purple-200 rounded-full h-2 mt-3">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${Math.min((index + 1) * 20, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              } else if (isTarget) {
                return (
                  <div key={index} className="ml-14 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                      <Target className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-800 font-medium leading-relaxed">
                        {item.trim()}
                      </p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="ml-14 p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 leading-relaxed italic">
                      {item.trim()}
                    </p>
                  </div>
                );
              }
            })}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
            <Award className="h-6 w-6 mr-3 text-green-600" />
            Personalized Recommendations
          </h3>
          <div className="space-y-3">
            {data.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeetCodeAnalyzer;