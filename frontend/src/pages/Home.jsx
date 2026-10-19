import React, { useState } from 'react';
import { GoEye, GoEyeClosed } from "react-icons/go";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { postImage } from '../config/util';
import { BsChatDotsFill, BsShieldLock, BsLightningCharge, BsPeopleFill } from "react-icons/bs";
import { FaUserAstronaut } from "react-icons/fa";

const Home = () => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loginPassView, setLoginPassView] = useState(false);
  const [passwordView, setPasswordView] = useState(false);
  const [confirmView, setConfirmView] = useState(false);
  const [picLoading, setPicLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser, api } = useUser();
  const navigate = useNavigate();

  const handleLoginChange = (e) => {
    setLoginData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSignupChange = (e) => {
    setSignupData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setPicLoading(true);
    try {
      const url = await postImage(file);
      if (url) {
        setAvatarUrl(url);
        toast.success('Avatar uploaded successfully!');
      } else {
        toast.error('Image upload failed. Please select a valid JPEG, PNG, or WEBP image.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Avatar upload failed');
    } finally {
      setPicLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.warn('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await res.json();

      if (data.success && data.data) {
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        setUser(data.data);
        toast.success(`Welcome back, ${data.data.name}!`);
        navigate('/chat');
      } else {
        toast.error(data.message || 'Invalid login credentials.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Unable to connect to the server. Please check your backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupData.name || !signupData.email || !signupData.password) {
      toast.warn('Please fill in all required fields.');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (signupData.password !== signupData.confirm) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        ...(avatarUrl ? { pic: avatarUrl } : {}),
      };

      const res = await fetch(`${api}api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        localStorage.setItem('userInfo', JSON.stringify(data.data));
        setUser(data.data);
        toast.success('Account created successfully!');
        navigate('/chat');
      } else {
        toast.error(data.message || 'Registration failed.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Registration failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Demo recruiter login quick fill
  const handleDemoRecruiterLogin = (email, password) => {
    setLoginData({ email, password });
    setIsLoginTab(true);
    toast.info(`Demo credentials loaded (${email}). Click 'Sign In' or hit Enter!`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Left Hero & Highlights (Resume Appeal) */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider">
            <BsLightningCharge className="text-brand-400" /> Real-Time MERN Architecture
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Connect Instantly with <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">V-Chat</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
            A full-stack communication platform powered by React 18, Node.js, Express, MongoDB, and persistent WebSocket channels for seamless private & group conversations.
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto lg:mx-0 text-left">
            <div className="glass-card p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <BsChatDotsFill size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Low-Latency</p>
                <p className="text-sm font-semibold text-white">Socket.IO Rooms</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <BsPeopleFill size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Collaboration</p>
                <p className="text-sm font-semibold text-white">Group Channels</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <BsShieldLock size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Security</p>
                <p className="text-sm font-semibold text-white">JWT & Bcrypt</p>
              </div>
            </div>

            <div className="glass-card p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <FaUserAstronaut size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400">Portfolio Ready</p>
                <p className="text-sm font-semibold text-white">Dockerized Stack</p>
              </div>
            </div>
          </div>

          {/* Recruiter Quick Test Hint */}
          <div className="pt-2 text-xs text-slate-400 flex flex-wrap gap-2 items-center justify-center lg:justify-start">
            <span>Recruiter Quick Fill:</span>
            <button
              type="button"
              onClick={() => handleDemoRecruiterLogin('guest@vchat.dev', 'GuestPass123!')}
              className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-brand-300 border border-slate-700 transition-colors"
            >
              Load Demo Account
            </button>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative">
            
            {/* Tab switch header */}
            <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setIsLoginTab(true)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  isLoginTab
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLoginTab(false)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isLoginTab
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Login Form */}
            {isLoginTab ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={loginPassView ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setLoginPassView(!loginPassView)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {loginPassView ? <GoEyeClosed size={18} /> : <GoEye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            ) : (
              /* Signup Form */
              <form onSubmit={handleSignup} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={signupData.name}
                    onChange={handleSignupChange}
                    placeholder="Alex Morgan"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={signupData.email}
                    onChange={handleSignupChange}
                    placeholder="alex@example.com"
                    required
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={passwordView ? "text" : "password"}
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      placeholder="Minimum 6 characters"
                      required
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordView(!passwordView)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {passwordView ? <GoEyeClosed size={18} /> : <GoEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={confirmView ? "text" : "password"}
                      name="confirm"
                      value={signupData.confirm}
                      onChange={handleSignupChange}
                      placeholder="Repeat your password"
                      required
                      className="w-full px-4 py-2.5 rounded-xl glass-input text-sm placeholder:text-slate-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmView(!confirmView)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {confirmView ? <GoEyeClosed size={18} /> : <GoEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Profile Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                  />
                  {picLoading && <p className="text-xs text-brand-400 mt-1">Uploading avatar...</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || picLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
