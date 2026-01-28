
import React, { useState, useEffect, useCallback } from 'react';
import { Subscription, Notification } from './types';
import DashboardStats from './components/DashboardStats';
import SubscriptionCard from './components/SubscriptionCard';
import SubscriptionForm from './components/SubscriptionForm';
import EmailDraftModal from './components/EmailDraftModal';
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

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_DATA);
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
    }, 10000); // Check status every 10 seconds
    
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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="font-black text-indigo-600 tracking-tight text-xl">SubTracker Pro</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Portfolio</h1>
          <p className="text-slate-500 mt-2">Manage and optimize your digital lifestyle.</p>
        </div>
        <div className="flex -space-x-2">
           {[1,2,3,4].map(i => (
             <img key={i} src={`https://picsum.photos/40/40?random=${i}`} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="User" />
           ))}
           <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-400">+12</div>
        </div>
      </header>

      <DashboardStats subscriptions={subscriptions} />

      <SubscriptionForm onAdd={handleAddSubscription} />

      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Your Subscriptions</h2>
        <div className="flex space-x-2">
          <button className="text-sm font-semibold text-slate-400 px-3 py-1 hover:text-slate-600">All</button>
          <button className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">Active</button>
          <button className="text-sm font-semibold text-slate-400 px-3 py-1 hover:text-slate-600">Expiring</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {subscriptions.map(sub => (
          <SubscriptionCard 
            key={sub.id} 
            sub={sub} 
            onDelete={handleDelete}
            onDraftEmail={handleDraftEmail}
          />
        ))}
        
        {subscriptions.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <svg className="w-12 h-12 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
            <p className="font-medium">No subscriptions yet. Use the form above to add your first one!</p>
          </div>
        )}
      </div>

      <EmailDraftModal 
        isOpen={isModalOpen} 
        content={emailDraft} 
        subName={selectedSub?.name || ''}
        onClose={() => setIsModalOpen(false)}
      />

      <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 text-sm">
        <p>© 2024 SubTracker Pro AI. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
