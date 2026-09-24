import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('admin@schoolerp.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleQuickFill = () => {
    setEmail('admin@schoolerp.in');
    setPassword('admin123');
    setError('');
    showToast('Demo credentials filled: admin@schoolerp.in / admin123', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      showToast('Welcome back, Admin! Session authenticated.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#f9f9ff]">
      <div className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-white border border-[#c5c5d3]/40">
        {/* Left Pane: Institutional Brand Surface */}
        <div className="lg:col-span-5 bg-[#00236f] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative ambient gradients */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-[#1e3a8a]/40 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-[#82f5c1]/20 blur-3xl pointer-events-none"></div>

          {/* Top Brand Identifier */}
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[#00236f] text-[28px]">
                  school
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">SchoolERP</span>
                <span className="text-[11px] text-[#dce1ff] uppercase tracking-wider font-semibold">
                  Early Years Edition
                </span>
              </div>
            </div>

            <div className="mt-2">
              <span className="text-xs text-[#85f8c4] bg-[#006c4a]/40 px-2.5 py-1 rounded-md uppercase tracking-wider font-bold inline-block border border-[#85f8c4]/30">
                Institutional OS
              </span>
              <h1 className="text-2xl font-bold text-white mt-3 leading-snug">
                Streamlined Administration for Micro &amp; Play Schools
              </h1>
              <p className="text-xs sm:text-sm text-[#dce1ff] mt-2 leading-relaxed opacity-90">
                Designed for early education founders, bursars, and compliance directors requiring
                maximum clarity and operational rigor.
              </p>
            </div>

            {/* Pillar Highlights */}
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex items-start gap-3 bg-[#1e3a8a]/40 p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-[#85f8c4] text-lg mt-0.5">
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">
                    Real-time student &amp; parent profiles
                  </span>
                  <span className="text-[11px] text-[#dce1ff]/80 mt-0.5">
                    Instant guardian communications, immunization data &amp; emergency dossiers.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1e3a8a]/40 p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-[#85f8c4] text-lg mt-0.5">
                  how_to_reg
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">
                    Single-click daily attendance marking
                  </span>
                  <span className="text-[11px] text-[#dce1ff]/80 mt-0.5">
                    Rapid batch processing for playgroups, nursery, and kindergarten cohorts.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#1e3a8a]/40 p-3 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-[#85f8c4] text-lg mt-0.5">
                  account_balance_wallet
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">
                    Automated fee ledger &amp; arrears tracking
                  </span>
                  <span className="text-[11px] text-[#dce1ff]/80 mt-0.5">
                    Zero-distraction reconciliation, receipt dispatch, and overdue alerts.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Footer */}
          <div className="relative z-10 pt-4 mt-6 border-t border-white/10">
            <div className="flex items-center gap-1.5 text-[#dce1ff]/70 text-[11px]">
              <span className="material-symbols-outlined text-xs text-[#85f8c4]">shield</span>
              <span>Single-tenant Admin Console • SSL Encrypted • Session Secured</span>
            </div>
          </div>
        </div>

        {/* Right Pane: Authentication Desk */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
          <div className="flex flex-col">
            {/* System Top Utility */}
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
                <span className="text-xs font-semibold text-[#006c4a]">
                  School Cluster Node #04 Online
                </span>
              </div>
              <span className="text-xs font-semibold text-[#444651] bg-[#f0f3ff] px-2.5 py-1 rounded-md border border-[#c5c5d3]/30">
                v3.4.1 Enterprise
              </span>
            </div>

            {/* Header */}
            <div className="mt-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111c2d] tracking-tight">
                Welcome back
              </h2>
              <p className="text-sm text-[#444651] mt-1">
                Sign in to access your school administrative dashboard.
              </p>
            </div>

            {/* Demo Quick-Fill Helper */}
            <div className="mt-5 bg-[#f0f3ff] p-3.5 rounded-xl flex items-center justify-between gap-3 border border-[#c5c5d3]/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="material-symbols-outlined text-[#1e3a8a] text-xl shrink-0">
                  key
                </span>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold text-[#111c2d]">Demo Credential Quick-Fill</span>
                  <span className="text-[11px] text-[#444651] font-mono truncate">
                    admin@schoolerp.in • admin123
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                className="shrink-0 bg-[#1e3a8a] text-white hover:bg-[#00236f] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
              >
                <span>Auto-fill</span>
                <span className="material-symbols-outlined text-sm">bolt</span>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold flex items-center gap-2 border border-[#ba1a1a]/20">
                <span className="material-symbols-outlined text-[16px]">error</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="loginEmail" className="text-xs font-semibold text-[#111c2d]">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#757682] text-lg pointer-events-none">
                    mail
                  </span>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@schoolerp.in"
                    className="w-full h-10 pl-10 pr-3 bg-[#f0f3ff] text-[#111c2d] text-sm rounded-xl border border-[#c5c5d3]/40 focus:outline-none focus:bg-white focus:border-[#1e3a8a] transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="loginPassword" className="text-xs font-semibold text-[#111c2d]">
                    Password
                  </label>
                  <div className="relative group">
                    <button
                      type="button"
                      className="text-xs text-[#444651] hover:text-[#1e3a8a] transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-30 w-56 p-2.5 bg-[#263143] text-white text-[11px] rounded-xl shadow-xl pointer-events-none">
                      Institutional password reset can be initiated by contacting platform administration.
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-[#757682] text-lg pointer-events-none">
                    lock
                  </span>
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full h-10 pl-10 pr-10 bg-[#f0f3ff] text-[#111c2d] text-sm rounded-xl border border-[#c5c5d3]/40 focus:outline-none focus:bg-white focus:border-[#1e3a8a] transition-all shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#757682] hover:text-[#111c2d] p-1 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1e3a8a] accent-[#1e3a8a] cursor-pointer"
                  />
                  <span className="text-xs text-[#111c2d]">Remember me for 30 days</span>
                </label>
                <span className="text-[11px] text-[#006c4a] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  TLS 1.3
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 h-11 bg-[#1e3a8a] hover:bg-[#00236f] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">sync</span>
                    <span>Authenticating Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Access Roster Info Card */}
            <div className="mt-5 grid grid-cols-3 gap-2 p-3 bg-[#f0f3ff] rounded-xl border border-[#c5c5d3]/40">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#444651] uppercase tracking-wider font-semibold">
                  Active Campus
                </span>
                <span className="text-xs font-bold text-[#111c2d] mt-0.5 truncate">
                  Oakridge Nursery
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#444651] uppercase tracking-wider font-semibold">
                  Active Term
                </span>
                <span className="text-xs font-bold text-[#111c2d] mt-0.5 truncate">
                  Term 2 (Spring)
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-[#444651] uppercase tracking-wider font-semibold">
                  Registered
                </span>
                <span className="text-xs font-bold text-[#111c2d] mt-0.5 truncate">
                  128 Enrolled
                </span>
              </div>
            </div>
          </div>

          {/* System Status Footer */}
          <div className="mt-6 pt-3 border-t border-[#c5c5d3]/30 flex flex-wrap items-center justify-between gap-2 text-[#444651]">
            <div className="flex items-center gap-1 text-[11px]">
              <span className="material-symbols-outlined text-[#006c4a] text-sm">
                calendar_today
              </span>
              <span>Academic Year 2026–27 active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span>
              <span>MongoDB Atlas connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
