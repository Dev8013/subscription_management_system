
import React, { useState } from 'react';
import { ReminderLog, Subscription } from '../types';
import { draftUpcomingDuesSummary } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logs: ReminderLog[];
  subscriptions: Subscription[];
  onProcessReminder: (logId: string) => void;
}

const ReminderCenter: React.FC<Props> = ({ isOpen, onClose, logs, subscriptions, onProcessReminder }) => {
  const [isDraftingSummary, setIsDraftingSummary] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDraftSummary = async () => {
    setIsDraftingSummary(true);
    const draft = await draftUpcomingDuesSummary(subscriptions);
    setSummaryDraft(draft);
    setIsDraftingSummary(false);
  };

  const handleSendEmail = (content: string) => {
    const subject = content.split('\n')[0].replace('Subject: ', '');
    const body = encodeURIComponent(content);
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
          <div>
            <h2 className="text-xl font-black">Reminder Center</h2>
            <p className="text-xs text-indigo-100 font-bold opacity-80 uppercase tracking-widest">Automation Logs</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Summary Section */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <h3 className="font-bold text-slate-800 dark:text-indigo-200 text-sm mb-2">Automated Due Summary</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 italic">Generate a single report for all impending dues.</p>
            
            {summaryDraft ? (
              <div className="space-y-3">
                <div className="text-[10px] font-mono bg-white dark:bg-slate-950 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50 max-h-40 overflow-y-auto">
                  {summaryDraft}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleSendEmail(summaryDraft)}
                    className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-all"
                  >
                    Send to Mail Client
                  </button>
                  <button 
                    onClick={() => setSummaryDraft(null)}
                    className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleDraftSummary}
                disabled={isDraftingSummary}
                className="w-full bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold py-3 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isDraftingSummary ? (
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04M12 21a8.966 8.966 0 01-5.982-2.275M15 15l1.293 1.293a1 1 0 001.414 0l3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 0L15 9" /></svg>
                )}
                Analyze Portfolio & Draft Summary
              </button>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent Activity</h3>
            
            {logs.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-slate-300 dark:text-slate-700">
                <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                <span className="text-xs font-bold">No reminder logs yet</span>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${log.type === 'summary' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30'}`}>
                      {log.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{new Date(log.sentAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-2 mb-3">
                    {log.content}
                  </p>
                  <button 
                    onClick={() => handleSendEmail(log.content)}
                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    Resend to client
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold text-center">
            Reminders are automated based on your portfolio health score.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReminderCenter;
