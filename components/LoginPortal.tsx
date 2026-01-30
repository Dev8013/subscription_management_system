
import React, { useState } from 'react';
import { signInWithPuter } from '../services/authService';
import { User } from '../types';

interface Props {
  onLoginSuccess: (user: User) => void;
}

const LoginPortal: React.FC<Props> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePuterLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const user = await signInWithPuter();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
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
      <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 mb-4 rotate-3">
             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">SubTracker Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Cloud-Native Subscription Intelligence</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sign in to sync your subscriptions to the cloud.</p>
            </div>

            <button 
              onClick={handlePuterLogin}
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
                  Sign in with Puter
                </>
              )}
            </button>

            {error && <p className="text-rose-500 text-xs font-bold text-center bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg">{error}</p>}

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
        </div>

        <div className="mt-12 text-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
            POWERED BY PUTER.JS
            <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800" />
          </div>
          <p className="normal-case max-w-[200px] leading-relaxed">Your data is stored in your private Puter cloud environment.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
