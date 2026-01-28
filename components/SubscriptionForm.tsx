
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
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Subscription</h2>
      
      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-2">Smart Add (Powered by Gemini)</label>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="e.g. Netflix Premium for $19.99 monthly"
            value={smartInput}
            onChange={(e) => setSmartInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button 
            type="button"
            onClick={handleSmartParse}
            disabled={isParsing}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isParsing ? 'Parsing...' : 'Magic Fill'}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">Describe your subscription and we'll fill the form for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">App Name</label>
          <input 
            required
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price</label>
          <input 
            type="number" step="0.01" required
            value={formData.price}
            onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Currency</label>
          <input 
            required
            value={formData.currency}
            onChange={e => setFormData({...formData, currency: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Billing Cycle</label>
          <select 
            value={formData.billingCycle}
            onChange={e => setFormData({...formData, billingCycle: e.target.value as BillingCycle})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm appearance-none"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Date</label>
          <input 
            type="date" required
            value={formData.endDate}
            onChange={e => setFormData({...formData, endDate: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
          <input 
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <button 
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors"
          >
            Add Subscription
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubscriptionForm;
