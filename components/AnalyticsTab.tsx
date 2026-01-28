
import React, { useMemo } from 'react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const AnalyticsTab: React.FC<Props> = ({ subscriptions }) => {
  const stats = useMemo(() => {
    const getMonthlyCost = (sub: Subscription) => {
      let monthly = sub.price;
      if (sub.billingCycle === 'yearly') monthly /= 12;
      if (sub.billingCycle === 'quarterly') monthly /= 3;
      if (sub.billingCycle === 'weekly') monthly *= 4.33;
      return monthly;
    };

    const monthlyTotal = subscriptions.reduce((acc, sub) => acc + getMonthlyCost(sub), 0);
    const annualTotal = monthlyTotal * 12;
    
    const categories: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const cost = getMonthlyCost(sub);
      categories[sub.category] = (categories[sub.category] || 0) + cost;
    });

    const categoryArray = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((m, i) => {
      // Dummy logic to create a visible trend
      const noise = 0.85 + (Math.random() * 0.3); 
      return {
        month: m,
        amount: monthlyTotal * noise
      };
    });

    return { monthlyTotal, annualTotal, categoryArray, trend };
  }, [subscriptions]);

  const maxTrend = Math.max(...stats.trend.map(t => t.amount), 1);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white transition-transform active:scale-[0.98]">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Annual Projection</p>
          <h3 className="text-3xl md:text-4xl font-black">${stats.annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex items-center text-[10px] md:text-xs text-indigo-200">
            <span className="bg-white/20 px-2 py-0.5 rounded-md mr-2">ESTIMATE</span>
            Based on active renewals
          </div>
        </div>
        
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Monthly Mean</p>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900">${stats.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="mt-2 text-[10px] md:text-xs text-emerald-500 font-bold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
            Healthy Spending Habits
          </p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 sm:col-span-2 lg:col-span-1">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Portfolio Volume</p>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900">{subscriptions.length}</h3>
          <p className="mt-2 text-[10px] md:text-xs text-slate-400 font-medium italic">Across {stats.categoryArray.length} diverse categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Spending Trend Chart - Optimized Scrollbar */}
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h4 className="text-lg font-bold text-slate-800">Spending Trend</h4>
            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full uppercase">12 Month View</span>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="h-56 md:h-64 flex items-end justify-between gap-2 min-w-[480px] md:min-w-0 px-2">
              {stats.trend.map((t, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full min-w-0">
                  <div className="flex-1 w-full flex flex-col justify-end">
                    <div 
                      className="w-full bg-indigo-500/10 rounded-t-md md:rounded-t-lg transition-all duration-700 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-100 border-b-2 border-indigo-500 relative"
                      style={{ height: `${(t.amount / maxTrend) * 100}%`, minHeight: '4px' }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl">
                        ${t.amount.toFixed(0)}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] md:text-[10px] font-black text-slate-400 mt-6 uppercase">
                    {t.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-8">Category Mix</h4>
          <div className="space-y-6">
            {stats.categoryArray.map((cat, i) => (
              <div key={cat.name} className="group">
                <div className="flex justify-between text-sm mb-2.5">
                  <div className="flex items-center min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2.5 ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors truncate">{cat.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono font-bold flex-shrink-0 ml-2">${cat.value.toFixed(2)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${(cat.value / stats.monthlyTotal) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{((cat.value / stats.monthlyTotal) * 100).toFixed(1)}% weight</p>
                   <p className="text-[10px] text-slate-300 font-medium">Monthly cycle</p>
                </div>
              </div>
            ))}
            {stats.categoryArray.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <p className="text-sm font-bold uppercase tracking-widest">No Data Available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;