
import React from 'react';

interface Props {
  isOpen: boolean;
  content: string;
  onClose: () => void;
  subName: string;
}

const EmailDraftModal: React.FC<Props> = ({ isOpen, content, onClose, subName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="bg-indigo-600 p-6 md:p-8 flex justify-between items-start text-white relative">
          <div className="pr-8">
            <h3 className="text-xl md:text-2xl font-black mb-1">AI Reminder Draft</h3>
            <p className="text-indigo-100 text-xs md:text-sm font-medium">Customized notification for {subName}</p>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-6 md:p-10">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-5 md:p-8 text-slate-700 font-medium text-sm md:text-base leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto custom-scrollbar">
            {content || (
              <div className="flex flex-col items-center py-10 space-y-4">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Consulting Gemini AI...</p>
              </div>
            )}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button 
              onClick={onClose} 
              className="w-full sm:w-auto px-8 py-3.5 font-bold text-slate-400 hover:text-slate-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              className="w-full sm:w-auto px-10 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 text-sm"
              onClick={() => {
                if(content) {
                  navigator.clipboard.writeText(content);
                  alert('Copied to clipboard!');
                }
              }}
            >
              Copy Notification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDraftModal;
