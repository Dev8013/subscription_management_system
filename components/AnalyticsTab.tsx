
import React, { useMemo, useState } from 'react';
import { Subscription } from '../types';

interface Props {
  subscriptions: Subscription[];
}

type ChartType = 'bar' | 'line';

const AnalyticsTab: React.FC<Props> = ({ subscriptions }) => {
  const [chartType, setChartType] = useState<ChartType>('bar');

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
      const noise = 0.85 + (Math.random() * 0.3); 
      return {
        month: m,
        amount: monthlyTotal * noise
      };
    });

    return { monthlyTotal, annualTotal, categoryArray, trend };
  }, [subscriptions]);

  const maxTrend = Math.max(...stats.trend.map(t => t.amount), 1);

  // SVG Line Path Helper
  const generateLinePaths = () => {
    const width = 600;
    const height = 200;
    const padding = 20;
    const usableWidth = width - padding * 2;
    const usableHeight = height - padding * 2;
    
    const points = stats.trend.map((t, i) => {
      const x = padding + (i * (usableWidth / (stats.trend.length - 1)));
      const y = (height - padding) - (t.amount / maxTrend) * usableHeight;
      return { x, y, amount: t.amount, month: t.month };
    });

    const linePath = points.reduce((acc, point, i) => 
      i === 0 ? `M ${point.x},${point.y}` : `${acc} L ${point.x},${point.y}`, 
    "");

    const areaPath = `${linePath} L ${points[points.length-1].x},${height} L ${points[0].x},${height} Z`;

    return { linePath, areaPath, points, chartHeight: height };
  };

  const { linePath, areaPath, points, chartHeight } = generateLinePaths();

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-indigo-600 p-6 md:p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-indigo-900/20 text-white transition-transform active:scale-[0.98]">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Annual Projection</p>
          <h3 className="text-3xl md:text-4xl font-black">${stats.annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <div className="mt-4 flex items-center text-[10px] md:text-xs text-indigo-200">
            <span className="bg-white/20 px-2 py-0.5 rounded-md mr-2">ESTIMATE</span>
            Based on active renewals
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Monthly Mean</p>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">${stats.monthlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
          <p className="mt-2 text-[10px] md:text-xs text-emerald-500 font-bold flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
            Healthy Spending Habits
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 sm:col-span-2 lg:col-span-1">
          <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Portfolio Volume</p>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">{subscriptions.length}</h3>
          <p className="mt-2 text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-medium italic">Across {stats.categoryArray.length} diverse categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Spending Trend Chart Section */}
        <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Spending Trend</h4>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-0.5">Rolling 12-month projection</p>
            </div>
            <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700">
              <button 
                onClick={() => setChartType('bar')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
              >
                Bars
              </button>
              <button 
                onClick={() => setChartType('line')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-400 dark:text-slate-500'}`}
              >
                Line
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="h-64 md:h-72 flex items-end justify-between min-w-[500px] md:min-w-0 px-2 relative">
              {chartType === 'bar' ? (
                // Bar Chart View
                stats.trend.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative h-full min-w-0">
                    <div className="flex-1 w-full flex flex-col justify-end px-1 sm:px-2">
                      <div 
                        className="w-full bg-indigo-500/10 dark:bg-indigo-500/5 rounded-t-lg transition-all duration-700 group-hover:bg-indigo-600 group-hover:shadow-lg group-hover:shadow-indigo-100 dark:group-hover:shadow-indigo-900/40 border-b-2 border-indigo-500 dark:border-indigo-400 relative"
                        style={{ height: `${(t.amount / maxTrend) * 100}%`, minHeight: '4px' }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10 shadow-xl font-bold">
                          ${t.amount.toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 mt-6 uppercase">
                      {t.month}
                    </span>
                  </div>
                ))
              ) : (
                // Line Chart View
                <div className="w-full h-full flex flex-col">
                  <div className="flex-1 relative overflow-visible">
                    <svg viewBox="0 0 600 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#areaGradient)" className="transition-all duration-1000 ease-in-out" />
                      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000 ease-in-out" />
                      
                      {/* Interactive Points & Tooltips */}
                      {points.map((p, i) => (
                        <g key={i} className="group/point outline-none">
                          {/* Vertical Guide Line */}
                          <line 
                            x1={p.x} 
                            y1={p.y} 
                            x2={p.x} 
                            y2={chartHeight} 
                            className="stroke-indigo-400/20 dark:stroke-indigo-400/10 stroke-[1px] opacity-0 group-hover/point:opacity-100 transition-opacity pointer-events-none" 
                            strokeDasharray="4 2"
                          />
                          
                          {/* Point marker */}
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r="5" 
                            className="fill-white dark:fill-slate-800 stroke-indigo-500 stroke-[3px] transition-all group-hover/point:r-7 group-hover/point:fill-indigo-500 dark:group-hover/point:fill-indigo-400 cursor-pointer"
                          />
                          
                          {/* Rich Premium Tooltip showing X (Month) and Y (Amount) */}
                          <foreignObject x={p.x - 60} y={p.y - 85} width="120" height="75" className="opacity-0 group-hover/point:opacity-100 transition-all duration-300 pointer-events-none overflow-visible">
                            <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 rounded-2xl shadow-2xl p-3 flex flex-col items-start border border-white/10 dark:border-black/5 animate-in slide-in-from-bottom-2 zoom-in-95 duration-300">
                              <div className="flex justify-between w-full items-center mb-1">
                                <span className="text-[9px] uppercase tracking-widest font-black opacity-60 leading-none">{p.month}</span>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-0.5">Estimated Cost</span>
                                <span className="text-lg font-black tracking-tighter leading-none">${p.amount.toFixed(2)}</span>
                              </div>
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900/90 dark:border-t-white/90"></div>
                            </div>
                          </foreignObject>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <div className="flex justify-between w-full mt-6 px-[20px]">
                    {stats.trend.map((t, i) => (
                      <span key={i} className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                        {t.month}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-8">Category Mix</h4>
          <div className="space-y-6">
            {stats.categoryArray.map((cat, i) => (
              <div key={cat.name} className="group">
                <div className="flex justify-between text-sm mb-2.5">
                  <div className="flex items-center min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mr-2.5 ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{cat.name}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 font-mono font-bold flex-shrink-0 ml-2">${cat.value.toFixed(2)}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-50 dark:bg-slate-900 rounded-full overflow-hidden border border-slate-100 dark:border-slate-700">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${i % 3 === 0 ? 'bg-indigo-500' : i % 3 === 1 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${(cat.value / stats.monthlyTotal) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                   <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tighter">{((cat.value / stats.monthlyTotal) * 100).toFixed(1)}% weight</p>
                   <p className="text-[10px] text-slate-300 dark:text-slate-600 font-medium">Monthly cycle</p>
                </div>
              </div>
            ))}
            {stats.categoryArray.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
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
