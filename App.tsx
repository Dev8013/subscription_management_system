
import React, { useState, useEffect } from 'react';
import { Subscription, ReminderLog } from './types';
import DashboardStats from './components/DashboardStats';
import SubscriptionCard from './components/SubscriptionCard';
import SubscriptionForm from './components/SubscriptionForm';
import EmailDraftModal from './components/EmailDraftModal';
import AnalyticsTab from './components/AnalyticsTab';
import MouseTrail from './components/MouseTrail';
import ReminderCenter from './components/ReminderCenter';
import { draftReminderEmail } from './services/geminiService';

const MOCK_DATA: Subscription[] = [
  {
    id: '1',
    name: 'Netflix Premium',
    price: 19.99,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-01-01',
    endDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    status: 'expiring'
  },
  {
    id: '2',
    name: 'Spotify Family',
    price: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-05-15',
    endDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Music',
    status: 'active'
  },
  {
    id: '3',
    name: 'AWS Cloud Services',
    price: 145.50,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-11-20',
    endDate: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Work',
    status: 'expiring'
  }
];

type Tab = 'dashboard' | 'analytics';

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_DATA);
  const [reminderLogs, setReminderLogs] = useState<ReminderLog[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReminderCenterOpen, setIsReminderCenterOpen] = useState(false);
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

  // Automated Reminder Logic
  useEffect(() => {
    const scanForDues = async () => {
      const expiring = subscriptions.filter(s => s.status === 'expiring' && !s.lastReminderSent);
      if (expiring.length > 0) {
        // Just take the first one to avoid spamming Gemini in one go
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

        setReminderLogs(prev => [newLog, ...prev]);
        setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, lastReminderSent: new Date().toISOString() } : s));
      }
    };

    const interval = setInterval(scanForDues, 60000); // Scan every minute
    scanForDues(); // Initial scan
    return () => clearInterval(interval);
  }, [subscriptions]);

  // Sync status based on time
  useEffect(() => {
    const interval = setInterval(() => {
      setSubscriptions(prev => prev.map(sub => {
        const diff = +new Date(sub.endDate) - +new Date();
        let status: 'active' | 'expiring' | 'expired' = 'active';
        if (diff <= 0) status = 'expired';
        else if (diff <= 3 * 24 * 60 * 60 * 1000) status = 'expiring';
        
        if (sub.status !== status) return { ...sub, status };
        return sub;
      }));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleAddSubscription = (newSub: Omit<Subscription, 'id' | 'status'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const diff = +new Date(newSub.endDate) - +new Date();
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (diff <= 0) status = 'expired';
    else if (diff <= 3 * 24 * 60 * 60 * 1000) status = 'expiring';

    const sub: Subscription = { ...newSub, id, status };
    setSubscriptions([sub, ...subscriptions]);
  };

  const handleDelete = (id: string) => {
    setSubscriptions(subscriptions.filter(s => s.id !== id));
  };

  const handleDraftEmail = async (sub: Subscription) => {
    setSelectedSub(sub);
    setIsModalOpen(true);
    setEmailDraft('');
    const draft = await draftReminderEmail(sub);
    setEmailDraft(draft);
  };

  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 transition-colors duration-300">
      <MouseTrail />
      
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex items-center justify-between md:justify-start space-x-2 mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <span className="font-black text-indigo-600 tracking-tight text-xl">SubTracker Pro</span>
            </div>
            
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={() => setIsReminderCenterOpen(true)}
                className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {expiringCount > 0 && <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>}
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Your Portfolio</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">Manage and optimize your digital lifestyle.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Desktop Only reminder center toggle */}
          <button 
            onClick={() => setIsReminderCenterOpen(true)}
            className="hidden md:flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm hover:shadow-md transition-all active:scale-95 border border-indigo-100 dark:border-indigo-800 relative"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <span className="text-xs font-bold uppercase tracking-wider">Reminder Logs</span>
            {expiringCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>}
          </button>

          {/* Desktop Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="hidden md:flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            {isDarkMode ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg>
                <span className="text-xs font-bold uppercase tracking-wider">Light Mode</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <span className="text-xs font-bold uppercase tracking-wider">Dark Mode</span>
              </>
            )}
          </button>

          {/* Tab Switcher */}
          <div className="bg-white dark:bg-slate-800 p-1 md:p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
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
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Subscriptions</h2>
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button className="text-xs font-bold text-indigo-600 bg-white dark:bg-slate-700 shadow-sm px-4 py-1.5 rounded-md">All</button>
                <button className="text-xs font-bold text-slate-500 px-4 py-1.5 hover:text-slate-700 dark:hover:text-slate-300">Upcoming</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {subscriptions.map(sub => (
                <SubscriptionCard 
                  key={sub.id} 
                  sub={sub} 
                  onDelete={handleDelete}
                  onDraftEmail={handleDraftEmail}
                />
              ))}
              
              {subscriptions.length === 0 && (
                <div className="col-span-full py-16 md:py-24 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  </div>
                  <p className="font-semibold text-slate-600 dark:text-slate-400">No subscriptions yet.</p>
                  <p className="text-sm mt-1">Add your first service using the Magic Fill bar above!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <AnalyticsTab subscriptions={subscriptions} />
        )}
      </main>

      <EmailDraftModal 
        isOpen={isModalOpen} 
        content={emailDraft} 
        subName={selectedSub?.name || ''}
        onClose={() => setIsModalOpen(false)}
      />

      <ReminderCenter 
        isOpen={isReminderCenterOpen}
        onClose={() => setIsReminderCenterOpen(false)}
        logs={reminderLogs}
        subscriptions={subscriptions}
        onProcessReminder={(id) => {}}
      />

      <footer className="mt-12 py-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 dark:text-slate-500 text-sm">
        <div className="flex items-center space-x-2">
           <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-500 font-bold">SP</div>
           <p>© 2024 SubTracker Pro AI</p>
        </div>
        <div className="flex space-x-6 font-medium">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
