
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-xl font-bold">Renewal Notification Draft</h3>
            <p className="text-indigo-100 text-sm">Personalized reminder for {subName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-8">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-700 font-serif leading-relaxed whitespace-pre-wrap">
            {content || "Generating your draft..."}
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button onClick={onClose} className="px-6 py-3 font-semibold text-slate-500 hover:text-slate-800 transition-colors">Close</button>
            <button className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200">Copy to Clipboard</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDraftModal;
