
import React, { useState } from 'react';
import { Subscription, BillingCycle } from '../types';
import { parseSmartInput } from '../services/geminiService';

interface Props {
  onAdd: (sub: Omit<Subscription, 'id' | 'status'>) => void;
}

const SubscriptionForm: React.FC<Props> = ({ onAdd }) => {
  const [smartInput, setSmartInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    currency: 'USD',
    billingCycle: 'monthly' as BillingCycle,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    category: 'Entertainment'
  });

  const handleSmartParse = async () => {
    if (!smartInput) return;
    setIsParsing(true);
    const result = await parseSmartInput(smartInput);
    if (result) {
      setFormData(prev => ({
        ...prev,
        name: result.name || prev.name,
        price: result.price || prev.price,
        billingCycle: (result.billingCycle?.toLowerCase() as BillingCycle) || prev.billingCycle,
        currency: result.currency || prev.currency,
        category: result.category || prev.category
      }));
    }
    setIsParsing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    setSmartInput('');
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 mb-10 max-w-4xl mx-auto transition-colors">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Add Service</h2>
      </div>
      
      <div className="mb-8">
        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Magic Fill (AI Support)</label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input 
            type="text" 
            placeholder="e.g. Netflix Premium $19.99 monthly"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
          />
          <button 
            type="button"
            onClick={handleSmartParse}
            disabled={isParsing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex-shrink-0 active:scale-95 shadow-md"
          >
            {isParsing ? 'Processing...' : 'Auto-Fill'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Service Name</label>
          <input 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Cost</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm">$</span>
            <input 
              type="number" step="0.01" required
              value={formData.price}
              onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Billing Cycle</label>
          <select 
            value={formData.billingCycle}
            onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}
            className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer dark:text-white"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Renewal Date</label>
          <input 
            type="date" required
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
            className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white color-scheme-dark"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-1">
          <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase mb-1.5 ml-1">Category</label>
          <input 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            placeholder="e.g. Entertainment, Work"
            className="w-full bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3 mt-4">
          <button 
            type="submit"
            className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
          >
            Confirm & Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;
