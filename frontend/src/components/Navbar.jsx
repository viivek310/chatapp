import React, { useEffect, useRef, useState } from 'react';
import { CiSearch } from "react-icons/ci";
import SideNav from './SideNav';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { useSocket } from '../context/SocketContext';
import { IoChevronDown, IoNotificationsOutline, IoLogOutOutline, IoPersonOutline } from "react-icons/io5";
import { BsChatDotsFill } from "react-icons/bs";

function Navbar({ open, setUser }) {
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  
  const { user, notification, setSelectedChat, setNotification, logout } = useUser();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const contextMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const notifMenuRef = useRef(null);
  const notifButtonRef = useRef(null);

  const handleClickOutside = (event) => {
    if (
      contextMenuRef.current &&
      !contextMenuRef.current.contains(event.target) &&
      userButtonRef.current &&
      !userButtonRef.current.contains(event.target)
    ) {
      setContextMenuOpen(false);
    }

    if (
      notifMenuRef.current &&
      !notifMenuRef.current.contains(event.target) &&
      notifButtonRef.current &&
      !notifButtonRef.current.contains(event.target)
    ) {
      setNotifMenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    if (n?.chat) {
      setSelectedChat(n.chat);
    }
    setNotification((prev) => prev.filter((item) => item !== n));
    setNotifMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (setUser && user) {
      setUser(user);
    }
    open();
    setContextMenuOpen(false);
  };

  const handleLogOut = () => {
    if (logout) {
      logout();
    } else {
      localStorage.removeItem("userInfo");
      navigate("/");
    }
  };

  return (
    <nav className="w-full glass-panel border-b border-white/10 text-white h-16 flex items-center justify-between px-4 sm:px-6 z-20 relative select-none">
      <SideNav open={sideNavOpen} setOpen={() => setSideNavOpen(false)} />

      {/* Brand & Search trigger */}
      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/chat")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <BsChatDotsFill size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent hidden sm:inline">
            V-Chat
          </span>
        </div>

        {/* Search Trigger */}
        <button
          onClick={() => setSideNavOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-white text-xs sm:text-sm transition-all"
        >
          <CiSearch size={18} className="text-brand-400" />
          <span className="hidden md:inline">Find users & conversations</span>
          <span className="md:hidden">Search</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 border border-slate-700 rounded text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Status & User Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Live Socket Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-white/5 text-[11px] text-slate-300">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
            }`}
          />
          <span>{isConnected ? "Connected" : "Connecting..."}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            ref={notifButtonRef}
            onClick={() => setNotifMenuOpen((prev) => !prev)}
            aria-label="Notifications"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-200 hover:text-white transition-all relative"
          >
            <IoNotificationsOutline size={20} />
            {notification?.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 animate-pulse">
                {notification.length}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div
              ref={notifMenuRef}
              className="absolute right-0 mt-2 w-72 sm:w-80 glass-panel rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Notifications
                </span>
                {notification?.length > 0 && (
                  <button
                    onClick={() => setNotification([])}
                    className="text-[11px] text-brand-400 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto space-y-1">
                {notification?.length > 0 ? (
                  notification.map((n, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleNotificationClick(n)}
                      className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-brand-600/20 hover:border-brand-500/30 border border-transparent transition-all cursor-pointer text-xs"
                    >
                      <p className="font-semibold text-white">
                        {n?.sender?.name || "Someone"}
                      </p>
                      <p className="text-slate-300 truncate">
                        {n?.content || "Sent you a message"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Popover */}
        <div className="relative">
          <button
            ref={userButtonRef}
            onClick={() => setContextMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.pic ? (
                <img
                  src={user.pic}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || "U"
              )}
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-200 hidden md:inline max-w-[120px] truncate">
              {user?.name}
            </span>
            <IoChevronDown size={14} className="text-slate-400 hidden sm:inline" />
          </button>

          {contextMenuOpen && (
            <div
              ref={contextMenuRef}
              className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1"
            >
              <div className="px-3 py-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <IoPersonOutline size={16} className="text-brand-400" />
                View Profile
              </button>

              <button
                onClick={handleLogOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <IoLogOutOutline size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
