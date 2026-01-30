
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
import { cloudStorage, AppData } from './services/driveService';
import { signOutPuter, getCurrentPuterUser } from './services/authService';

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
    const checkSession = async () => {
      const existingUser = await getCurrentPuterUser();
      if (existingUser) {
        handleLogin(existingUser);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const performSync = useCallback(async (subs: Subscription[], logs: ReminderLog[]) => {
    if (!user || user.id === 'dev-mode-user') return;
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    try {
      const payload: AppData = {
        subscriptions: subs,
        reminderLogs: logs,
        version: '1.1.0',
        updatedAt: new Date().toISOString()
      };
      await cloudStorage.syncToCloud(payload);
      setSyncState({ isSyncing: false, lastSyncedAt: new Date().toISOString(), error: null });
    } catch (err) {
      setSyncState(prev => ({ ...prev, isSyncing: false, error: 'Cloud Sync Failed' }));
    }
  }, [user]);

  const handleLogin = async (loggedUser: User) => {
    setUser(loggedUser);
    setSyncState(prev => ({ ...prev, isSyncing: true }));
    if (loggedUser.id !== 'dev-mode-user') {
      const data = await cloudStorage.fetchFromCloud();
      if (data) {
        setSubscriptions(data.subscriptions);
        setReminderLogs(data.reminderLogs);
      }
    }
    setSyncState({ isSyncing: false, lastSyncedAt: new Date().toISOString(), error: null });
  };

  const handleLogout = async () => {
    await signOutPuter();
    setUser(null);
    setSubscriptions([]);
    setReminderLogs([]);
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

  const handleExportCSV = () => {
    const headers = ['Name', 'Price', 'Currency', 'Cycle', 'Category', 'End Date'];
    const rows = subscriptions.map(s => [s.name, s.price, s.currency, s.billingCycle, s.category, s.endDate]);
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `subtracker_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (!user) {
    return <LoginPortal onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 transition-colors duration-300 relative">
      <MouseTrail />
      
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="font-black text-indigo-600 tracking-tight text-xl">SubTracker Pro</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {user.name}'s Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Autonomous Financial Intelligence</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export CSV
          </button>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsReminderCenterOpen(true)}
              className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 relative border border-indigo-100 dark:border-indigo-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {isDarkMode ? '🌞' : '🌙'}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 flex shadow-sm">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
            >
              Intelligence
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
                <SubscriptionCard key={sub.id} sub={sub} onDelete={handleDelete} onDraftEmail={() => {}} />
              ))}
            </div>
          </div>
        ) : (
          <AnalyticsTab subscriptions={subscriptions} />
        )}
      </main>
      
      <ReminderCenter isOpen={isReminderCenterOpen} onClose={() => setIsReminderCenterOpen(false)} logs={reminderLogs} subscriptions={subscriptions} onProcessReminder={() => {}} />
    </div>
  );
};

export default App;
