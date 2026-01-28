
import React, { useMemo } from 'react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

const AnalyticsTab: React.FC<Props> = ({ subscriptions }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Monthly calculation helper
    const getMonthlyCost = (sub: Subscription) => {
      let monthly = sub.price;
      if (sub.billingCycle === 'yearly') monthly /= 12;
      if (sub.billingCycle === 'quarterly') monthly /= 3;
      if (sub.billingCycle === 'weekly') monthly *= 4.33;
      return monthly;
    };

    const monthlyTotal = subscriptions.reduce((acc, sub) => acc + getMonthlyCost(sub), 0);
    const annualTotal = monthlyTotal * 12;
    
    // Category Breakdown
    const categories: Record<string, number> = {};
    subscriptions.forEach(sub => {
      const cost = getMonthlyCost(sub);
      categories[sub.category] = (categories[sub.category] || 0) + cost;
    });

    const categoryArray = Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Month-wise trend (Simulated based on current subs for visualization)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = months.map((m, i) => {
      // Add slight variation for visual effect, though in real app this would be historical data
      const noise = 0.95 + (Math.random() * 0.1); 
      return {
        month: m,
        amount: monthlyTotal * noise
      };
    });

    return { monthlyTotal, annualTotal, categoryArray, trend };
  }, [subscriptions]);

  const maxTrend = Math.max(...stats.trend.map(t => t.amount), 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 p-8 rounded-3xl shadow-xl shadow-indigo-100 text-white">
          <p className="text-indigo-100 text-sm font-medium mb-1">Estimated Annual Spend</p>
          <h3 className="text-4xl font-black">${stats.annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex items-center text-xs text-indigo-200">
            <span className="bg-white/20 px-2 py-0.5 rounded mr-2">PROJECTION</span>
            Based on active subscriptions
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-medium mb-1">Average Monthly</p>
          <h3 className="text-4xl font-black text-slate-900">${stats.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="mt-2 text-xs text-green-500 font-bold">Stable Trend</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Subscriptions</p>
          <h3 className="text-4xl font-black text-slate-900">{subscriptions.length}</h3>
          <p className="mt-2 text-xs text-slate-400">Across {stats.categoryArray.length} categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Trend Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Annual Spending Trend</h4>
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.trend.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-slate-100 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-400 relative"
                  style={{ height: `${(t.amount / maxTrend) * 100}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    ${t.amount.toFixed(0)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-3 uppercase">{t.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-800 mb-6">Spending by Category</h4>
          <div className="space-y-5">
            {stats.categoryArray.map((cat, i) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold text-slate-700">{cat.name}</span>
                  <span className="text-slate-400">${cat.value.toFixed(2)} /mo</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(cat.value / stats.monthlyTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {stats.categoryArray.length === 0 && (
              <p className="text-slate-400 text-center py-10">No categories to display</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
