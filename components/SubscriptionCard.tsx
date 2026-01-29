
import React from 'react';
import { Subscription } from '../types';
import CountdownTimer from './CountdownTimer';

interface Props {
  sub: Subscription;
  onDelete: (id: string) => void;
  onDraftEmail: (sub: Subscription) => void;
}

const SubscriptionCard: React.FC<Props> = ({ sub, onDelete, onDraftEmail }) => {
  const isExpiring = sub.status === 'expiring';
  
  return (
    <div className={`relative bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border transition-all hover:shadow-md ${isExpiring ? 'border-rose-100 dark:border-rose-900 ring-1 ring-rose-50 dark:ring-rose-900/20' : 'border-slate-100 dark:border-slate-700'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl ${isExpiring ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-500' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
            {sub.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 leading-tight truncate">{sub.name}</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">{sub.category}</span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-slate-900 dark:text-slate-100">{sub.currency} {sub.price.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sub.billingCycle}</p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Ends in</span>
          <CountdownTimer endDate={sub.endDate} />
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">Due Date</span>
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{new Date(sub.endDate).toLocaleDateString()}</p>
        </div>
      </div>

      {sub.lastReminderSent && (
        <div className="mt-3 flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md w-fit">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Reminder Active
        </div>
      )}

      <div className="mt-4 flex space-x-2">
        <button 
          onClick={() => onDraftEmail(sub)}
          className="flex-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold py-2 px-3 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
        >
          {sub.lastReminderSent ? 'Regenerate Draft' : 'Draft Reminder'}
        </button>
        <button 
          onClick={() => onDelete(sub.id)}
          className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 font-semibold py-2 px-3 rounded-lg transition-all"
        >
          Delete
        </button>
      </div>
      
      {isExpiring && (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-800 animate-bounce">
          DUE
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;
