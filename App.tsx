
import React, { useState, useEffect, useCallback } from 'react';
import { Subscription, ReminderLog, User, SyncState } from './types';
import DashboardStats from './components/DashboardStats';
import SubscriptionCard from './components/SubscriptionCard';
import SubscriptionForm from './components/SubscriptionForm';
import EmailDraftModal from './components/EmailDraftModal';
import AnalyticsTab from './components/AnalyticsTab';
import MouseTrail from './components/MouseTrail';
import ReminderCenter from './components/ReminderCenter';
import LoginPortal from './components/LoginPortal';
import { draftReminderEmail } from './services/geminiService';
import { driveSync, AppData } from './services/driveService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics'>('dashboard');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
  const [syncState, setSyncState] = useState<SyncState>({ isSyncing: false, lastSyncedAt: null, error: null });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Sync data to Drive whenever it changes
  const performSync = useCallback(async (subs: Subscription[], logs: ReminderLog[]) => {
    if (!user) return;
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    try {
      const payload: AppData = {
        subscriptions: subs,
        reminderLogs: logs,
        version: '1.0.0',
        updatedAt: new Date().toISOString()
      };
      await driveSync.syncToDrive(payload);
      setSyncState({ isSyncing: false, lastSyncedAt: new Date().toISOString(), error: null });
    } catch (err) {
      setSyncState(prev => ({ ...prev, isSyncing: false, error: 'Cloud Sync Failed' }));
    }
  }, [user]);

  // Automated Reminder Logic
  useEffect(() => {
    if (!user) return;
    const scanForDues = async () => {
      const expiring = subscriptions.filter(s => s.status === 'expiring' && !s.lastReminderSent);
      if (expiring.length > 0) {
        const sub = expiring[0];
        const draft = await draftReminderEmail(sub);
        
        const newLog: ReminderLog = {
          id: Math.random().toString(36).substr(2, 9),
          subscriptionId: sub.id,
          type: 'single',
          content: draft,
          sentAt: new Date().toISOString(),
          status: 'processed'
        };

        const updatedLogs = [newLog, ...reminderLogs];
        const updatedSubs = subscriptions.map(s => s.id === sub.id ? { ...s, lastReminderSent: new Date().toISOString() } : s);
        
        setReminderLogs(updatedLogs);
        setSubscriptions(updatedSubs);
        performSync(updatedSubs, updatedLogs);
      }
    };

    const interval = setInterval(scanForDues, 60000);
    scanForDues();
    return () => clearInterval(interval);
  }, [subscriptions, reminderLogs, user, performSync]);

  const handleLogin = async (loggedUser: User) => {
    setUser(loggedUser);
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    const data = await driveSync.fetchFromDrive();
    if (data) {
      setSubscriptions(data.subscriptions);
      setReminderLogs(data.reminderLogs);
    }
    setSyncState({ isSyncing: false, lastSyncedAt: new Date().toISOString(), error: null });
  };

  const handleLogout = () => {
    setUser(null);
    setSubscriptions([]);
    setReminderLogs([]);
    driveSync.logout();
  };

  const handleAddSubscription = (newSub: Omit<Subscription, 'id' | 'status'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const diff = +new Date(newSub.endDate) - +new Date();
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (diff <= 0) status = 'expired';
    else if (diff <= 3 * 24 * 60 * 60 * 1000) status = 'expiring';

    const updatedSubs = [{ ...newSub, id, status }, ...subscriptions];
    setSubscriptions(updatedSubs);
    performSync(updatedSubs, reminderLogs);
  };

  const handleDelete = (id: string) => {
    const updatedSubs = subscriptions.filter(s => s.id !== id);
    setSubscriptions(updatedSubs);
    performSync(updatedSubs, reminderLogs);
  };

  const handleDraftEmail = async (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
    setEmailDraft('');
    const draft = await draftReminderEmail(sub);
    setEmailDraft(draft);
  };

  if (!user) {
    return <LoginPortal onLoginSuccess={handleLogin} />;
  }

  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 transition-colors duration-300 relative">
      <MouseTrail />
      
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200 dark:shadow-none">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-black text-indigo-600 tracking-tight text-xl">SubTracker Pro</span>
            </div>
            {syncState.isSyncing && (
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 animate-pulse-soft">
                 <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                 <span className="text-[10px] font-black uppercase tracking-widest">Syncing Cloud</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Portfolio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">Logged in as <span className="text-slate-800 dark:text-slate-200 font-bold">{user.email}</span></p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* User Profile / Logout */}
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-1.5 pr-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group">
            <img src={user.avatar} className="w-9 h-9 rounded-xl border-2 border-slate-50 dark:border-slate-900 shadow-sm" alt="User" />
            <button 
              onClick={handleLogout}
              className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsReminderCenterOpen(true)}
              className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 relative border border-indigo-100 dark:border-indigo-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {expiringCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />}
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 flex shadow-sm">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Analytics
            </button>
          </div>
        </div>
      </header>

      <main className="pb-12">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardStats subscriptions={subscriptions} />
            <SubscriptionForm onAdd={handleAddSubscription} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {subscriptions.map(sub => (
                <SubscriptionCard key={sub.id} sub={sub} onDelete={handleDelete} onDraftEmail={handleDraftEmail} />
              ))}
              {subscriptions.length === 0 && (
                <div className="col-span-full py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                  </div>
                  <p className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest">No Cloud Data Found</p>
                  <p className="text-sm mt-2 opacity-60 font-medium">Start adding subscriptions to sync them to your Drive.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnalyticsTab subscriptions={subscriptions} />
        )}
      </main>

      <EmailDraftModal isOpen={isModalOpen} content={emailDraft} subName={selectedSub?.name || ''} onClose={() => setIsModalOpen(false)} />
      <ReminderCenter isOpen={isReminderCenterOpen} onClose={() => setIsReminderCenterOpen(false)} logs={reminderLogs} subscriptions={subscriptions} onProcessReminder={() => {}} />

      <footer className="mt-20 py-10 border-t border-slate-100 dark:border-slate-800 text-center">
         <div className="flex items-center justify-center gap-2 mb-4">
           <div className="w-2 h-2 bg-emerald-500 rounded-full" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cloud Encrypted Session Active</span>
         </div>
         <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">© 2024 SubTracker Pro AI. Built for privacy-first subscription management.</p>
      </footer>
    </div>
  );
};

export default App;
