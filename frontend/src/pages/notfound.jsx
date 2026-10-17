import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BsChatDots } from 'react-icons/bs';

const notfound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-bg text-slate-100 select-none">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl text-center space-y-4 shadow-2xl border border-white/10">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 text-brand-400 mx-auto flex items-center justify-center shadow-glow mb-2">
          <BsChatDots size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-lg font-bold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The channel or page you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

export default notfound;
