
import React, { useState, useEffect } from 'react';
import { Subscription } from './types';
import DashboardStats from './components/DashboardStats';
import SubscriptionCard from './components/SubscriptionCard';
import SubscriptionForm from './components/SubscriptionForm';
import EmailDraftModal from './components/EmailDraftModal';
import AnalyticsTab from './components/AnalyticsTab';
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
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    price: 54.99,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-02-10',
    endDate: new Date(new Date().getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Design',
    status: 'active'
  },
  {
    id: '5',
    name: 'ChatGPT Plus',
    price: 20.00,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2024-01-05',
    endDate: new Date(new Date().getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'AI',
    status: 'active'
  },
  {
    id: '6',
    name: 'Disney+',
    price: 139.99,
    currency: 'USD',
    billingCycle: 'yearly',
    startDate: '2023-08-12',
    endDate: new Date(new Date().getTime() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Entertainment',
    status: 'active'
  },
  {
    id: '7',
    name: 'Peloton App',
    price: 44.00,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-03-20',
    endDate: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Fitness',
    status: 'active'
  },
  {
    id: '8',
    name: 'GitHub Copilot',
    price: 10.00,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2023-12-01',
    endDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Work',
    status: 'active'
  },
  {
    id: '9',
    name: 'Xbox Game Pass',
    price: 16.99,
    currency: 'USD',
    billingCycle: 'monthly',
    startDate: '2024-02-15',
    endDate: new Date(new Date().getTime() + 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    category: 'Gaming',
    status: 'expiring'
  }
];

type Tab = 'dashboard' | 'analytics';

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_DATA);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [emailDraft, setEmailDraft] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="font-black text-indigo-600 tracking-tight text-xl">SubTracker Pro</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Your Portfolio</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Manage and optimize your digital lifestyle.</p>
        </div>

        {/* Tab Switcher - Mobile Friendly */}
        <div className="bg-white p-1 md:p-1.5 rounded-2xl shadow-sm border border-slate-100 flex w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Analytics
          </button>
        </div>
      </header>

      <main className="pb-12">
        {activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <DashboardStats subscriptions={subscriptions} />
            <SubscriptionForm onAdd={handleAddSubscription} />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-800">Your Subscriptions</h2>
              <div className="flex bg-slate-100/50 p-1 rounded-lg">
                <button className="text-xs font-bold text-indigo-600 bg-white shadow-sm px-4 py-1.5 rounded-md">All</button>
                <button className="text-xs font-bold text-slate-500 px-4 py-1.5 hover:text-slate-700">Upcoming</button>
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
                <div className="col-span-full py-16 md:py-24 bg-white rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  </div>
                  <p className="font-semibold text-slate-600">No subscriptions yet.</p>
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

      <footer className="mt-12 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-400 text-sm">
        <div className="flex items-center space-x-2">
           <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-500 font-bold">SP</div>
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
