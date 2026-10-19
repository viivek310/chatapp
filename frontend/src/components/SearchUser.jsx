import React from 'react';
import { Avatar } from './common/Avatar';

function SearchUser({ chat, handleClick }) {
  return (
    <div
      onClick={handleClick}
      className="p-3 rounded-xl bg-slate-900/50 hover:bg-brand-600/20 border border-white/5 hover:border-brand-500/30 transition-all duration-200 flex items-center gap-3 cursor-pointer group shadow-sm"
    >
      <Avatar
        src={chat?.pic}
        name={chat?.name || "User"}
        className="w-10 h-10"
      />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs text-white group-hover:text-brand-300 transition-colors truncate">
          {chat?.name}
        </p>
        <p className="text-[11px] text-slate-400 truncate">
          {chat?.email}
        </p>
      </div>
    </div>
  );
}

export default SearchUser;
