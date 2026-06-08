import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, ShieldAlert, Loader } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useApp();
  const [activeTab, setActiveTab] = useState('login');

  // Login Form
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName,     setRegName]     = useState('');
  const [regEmail,    setRegEmail]    = useState('');
  const [regPassword, setRegPassword] = useState('');

  // UI State
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear messages on tab change
  useEffect(() => {
    setErrorMsg('');
    setSuccessMsg('');
  }, [activeTab]);

  // Escape to close
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ── Login Submit ─────────────────────────────────────────────
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!loginEmail.trim() || !loginPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await login(loginEmail, loginPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        onClose();
        setLoginEmail('');
        setLoginPassword('');
        setSuccessMsg('');
      }, 900);
    } else {
      setErrorMsg(result.message);
    }
  };

  // ── Register Submit ──────────────────────────────────────────
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const result = await register(regName, regEmail, regPassword);
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        onClose();
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setSuccessMsg('');
      }, 900);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 text-white shadow-2xl overflow-hidden z-10 flex flex-col">

        {/* Header Tab Bar */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'login'
                ? 'bg-neutral-800 text-white border-b-2 border-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
              activeTab === 'register'
                ? 'bg-neutral-800 text-white border-b-2 border-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/40'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white z-20 cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Form Content */}
        <div className="p-6 sm:p-8 flex-grow">

          {/* Error */}
          {errorMsg && (
            <div className="mb-5 bg-red-950/40 border border-red-800/60 p-3.5 flex items-start gap-2.5 text-xs text-red-300">
              <ShieldAlert size={16} className="mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success */}
          {successMsg && (
            <div className="mb-5 bg-green-950/40 border border-green-800/60 p-3.5 flex items-center gap-2.5 text-xs text-green-300">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest py-3.5 transition-colors duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader size={14} className="animate-spin" /> : null}
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            </form>

          ) : (
          /* ── REGISTER FORM ── */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    placeholder="E.g., Jane Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    placeholder="E.g., jane@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Password * <span className="text-neutral-600 normal-case tracking-normal font-normal">(min 6 characters)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 text-slate-100 pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:border-neutral-500 focus:bg-black rounded-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest py-3.5 transition-colors duration-150 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader size={14} className="animate-spin" /> : null}
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
