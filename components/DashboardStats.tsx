
import React from 'react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const DashboardStats: React.FC<Props> = ({ subscriptions }) => {
  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    let monthlyPrice = sub.price;
    if (sub.billingCycle === 'yearly') monthlyPrice /= 12;
    if (sub.billingCycle === 'quarterly') monthlyPrice /= 3;
    if (sub.billingCycle === 'weekly') monthlyPrice *= 4.33;
    return acc + monthlyPrice;
  }, 0);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiringCount = subscriptions.filter(s => s.status === 'expiring').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:border-indigo-100 dark:hover:border-indigo-900">
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Monthly Spending</p>
        <div className="flex items-baseline mt-2">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">${monthlyTotal.toFixed(2)}</span>
          <span className="ml-2 text-slate-400 dark:text-slate-500 text-xs font-medium">avg / mo</span>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:border-emerald-100 dark:hover:border-emerald-900">
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Active Services</p>
        <div className="flex items-baseline mt-2">
          <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{activeCount}</span>
          <span className="ml-2 text-emerald-500 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">Running</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between transition-all hover:border-rose-100 dark:hover:border-rose-900 sm:col-span-2 lg:col-span-1">
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold uppercase tracking-wider">Renewal Alerts</p>
        <div className="flex items-baseline mt-2">
          <span className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400">{expiringCount}</span>
          <span className="ml-2 text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">Due Soon</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
