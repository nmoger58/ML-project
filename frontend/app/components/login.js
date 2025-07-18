import React, { useState } from 'react';
import { User, Mail, Lock, Github, Code, Phone, FileText, UserCheck, LogIn, UserPlus } from 'lucide-react';

const AuthComponent = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    leetcodeId: '',
    githubId: '',
    phone: '',
    about: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignup = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:3001/api/user/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Account created successfully!' });
        setSignupData({
          username: '',
          email: '',
          password: '',
          leetcodeId: '',
          githubId: '',
          phone: '',
          about: ''
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to create account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:3001/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Login successful!' });
        // Here you would typically redirect or handle successful login
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid credentials' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage({ type: '', text: '' });
  };

  const InputField = ({ icon: Icon, label, name, type = 'text', required = false, color = 'blue', placeholder, value, onChange }) => (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${colorClasses[color].text}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className={`h-5 w-5 ${colorClasses[color].icon}`} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`block w-full pl-10 pr-3 py-3 border ${colorClasses[color].border} rounded-lg focus:ring-2 focus:ring-${color}-500 focus:border-transparent ${colorClasses[color].bg} ${colorClasses[color].text} placeholder-gray-500 transition-all duration-200`}
        />
      </div>
    </div>
  );

  const LoginForm = () => (
    <div className="space-y-6">
      <InputField
        icon={Mail}
        label="Email"
        name="email"
        type="email"
        required
        color="blue"
        placeholder="Enter your email"
        value={loginData.email}
        onChange={handleLoginChange}
      />
      
      <InputField
        icon={Lock}
        label="Password"
        name="password"
        type="password"
        required
        color="purple"
        placeholder="Enter your password"
        value={loginData.password}
        onChange={handleLoginChange}
      />

      <div className="flex items-center justify-between">
        <label className="flex items-center">
          <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          <span className="ml-2 text-sm text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
          Forgot password?
        </a>
      </div>
    </div>
  );

  const SignupForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          icon={User}
          label="Username"
          name="username"
          required
          color="blue"
          placeholder="Enter your username"
          value={signupData.username}
          onChange={handleSignupChange}
        />
        
        <InputField
          icon={Mail}
          label="Email"
          name="email"
          type="email"
          required
          color="green"
          placeholder="Enter your email"
          value={signupData.email}
          onChange={handleSignupChange}
        />
      </div>

      <InputField
        icon={Lock}
        label="Password"
        name="password"
        type="password"
        required
        color="purple"
        placeholder="Enter a strong password"
        value={signupData.password}
        onChange={handleSignupChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          icon={Code}
          label="LeetCode ID"
          name="leetcodeId"
          color="orange"
          placeholder="Your LeetCode username"
          value={signupData.leetcodeId}
          onChange={handleSignupChange}
        />
        
        <InputField
          icon={Github}
          label="GitHub ID"
          name="githubId"
          color="blue"
          placeholder="Your GitHub username"
          value={signupData.githubId}
          onChange={handleSignupChange}
        />
      </div>

      <InputField
        icon={Phone}
        label="Phone Number"
        name="phone"
        type="tel"
        color="green"
        placeholder="Your phone number"
        value={signupData.phone}
        onChange={handleSignupChange}
      />

      <div className="space-y-2">
        <label className={`block text-sm font-medium ${colorClasses.purple.text}`}>
          About You
        </label>
        <div className="relative">
          <div className="absolute top-3 left-3 pointer-events-none">
            <FileText className={`h-5 w-5 ${colorClasses.purple.icon}`} />
          </div>
          <textarea
            name="about"
            value={signupData.about}
            onChange={handleSignupChange}
            rows={4}
            placeholder="Tell us a bit about yourself..."
            className={`block w-full pl-10 pr-3 py-3 border ${colorClasses.purple.border} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${colorClasses.purple.bg} ${colorClasses.purple.text} placeholder-gray-500 transition-all duration-200 resize-none`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with Toggle */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-3">
                  {isLogin ? <LogIn className="h-8 w-8 text-white" /> : <UserCheck className="h-8 w-8 text-white" />}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-blue-100">
                    {isLogin ? 'Sign in to your account' : 'Join our developer community'}
                  </p>
                </div>
              </div>
              
              {/* Toggle Buttons */}
              <div className="flex bg-white/20 rounded-lg p-1">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isLogin 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <LogIn className="h-4 w-4 inline mr-2" />
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    !isLogin 
                      ? 'bg-white text-blue-700 shadow-sm' 
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <UserPlus className="h-4 w-4 inline mr-2" />
                  Signup
                </button>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {message.text && (
              <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {isLogin ? <LoginForm /> : <SignupForm />}

            <div className="pt-6">
              <button
                type="button"
                onClick={isLogin ? handleLogin : handleSignup}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    {isLogin ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </button>
            </div>

            <div className="text-center text-sm text-gray-600 mt-6">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthComponent;