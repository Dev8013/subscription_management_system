
import React, { useState } from 'react';
import { sendOTP, verifyOTP } from '../services/authService';
import { User } from '../types';

interface Props {
  onLoginSuccess: (user: User) => void;
}

const LoginPortal: React.FC<Props> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const code = await sendOTP(email);
      setGeneratedOtp(code);
      setStep('otp');
    } catch (err) {
      setError('Failed to send security key. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await verifyOTP(email, otp, generatedOtp);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    const devUser: User = {
      id: 'dev-mode-user',
      email: 'developer@subtracker.pro',
      name: 'Developer',
      lastLogin: new Date().toISOString(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=dev`
    };
    onLoginSuccess(devUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 mb-4 rotate-3">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">SubTracker Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Subscription Intelligence & Secure Cloud Sync</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
          {step === 'email' ? (
            <div className="space-y-6">
              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 ml-1">Work Email Address</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      required 
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                </div>

                {error && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg">{error}</p>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Send Security Key <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>
                  )}
                </button>
              </form>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Internal Access</span>
                <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              <button 
                type="button"
                onClick={handleDevLogin}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                Login as Developer
              </button>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3 ml-1">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Enter Security Key</label>
                  <button type="button" onClick={() => setStep('email')} className="text-xs font-bold text-indigo-600 hover:underline">Change Email</button>
                </div>
                <input 
                  type="text" 
                  maxLength={6} 
                  required 
                  placeholder="000 000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-center text-2xl font-black tracking-[1em] focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  autoFocus
                />
                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center italic">A 6-digit code was simulated for <b>{email}</b>. Check your system logs.</p>
              </div>

              {error && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg">{error}</p>}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify & Sync Drive <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04" /></svg></>
                )}
              </button>
            </form>
          )}
        </div>

        <div className="mt-12 text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
            SECURED BY GOOGLE DRIVE API
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
          </div>
          <p className="normal-case max-w-[200px] leading-relaxed">Your data never touches our servers. It stays in your private Google Drive sanctuary.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
