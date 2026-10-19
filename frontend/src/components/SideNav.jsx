import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../context/userContext';
import { toast } from 'react-toastify';
import SearchUser from './SearchUser';
import { IoClose } from 'react-icons/io5';
import { CiSearch } from 'react-icons/ci';

function SideNav({ open, setOpen }) {
  const sideNavRef = useRef(null);
  const [search, setSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, setSelectedChat, setChats, api, setChatOpen } = useUser();

  const handleClickOutside = (event) => {
    if (sideNavRef.current && !sideNavRef.current.contains(event.target)) {
      setOpen();
    }
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setSearch(val);

    if (!val || val.trim() === "") {
      setSearchResult(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}api/user?search=${val.trim()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const { data, success, error } = await res.json();
      if (success && Array.isArray(data)) {
        setSearchResult(data.slice(0, 10));
      } else if (error === "jwt") {
        localStorage.removeItem("userInfo");
      }
    } catch (error) {
      console.error("[Search User Error]:", error);
    } finally {
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const { data, success } = await res.json();
      if (success && data) {
        setSelectedChat(data);
        setChats((prev) => {
          if (!prev.find((c) => c._id === data._id)) {
            return [data, ...prev];
          }
          return prev;
        });
        setChatOpen(false); // Open chat box on mobile
        setSearch('');
        setSearchResult(null);
        setOpen();
      }
    } catch (err) {
      console.error("[Access Chat Error]:", err);
      toast.error("Failed to start chat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity" />
      )}

      {/* Slide-out Drawer */}
      <aside
        ref={sideNavRef}
        className={`fixed top-0 left-0 h-screen w-80 sm:w-96 bg-[#0c1220] border-r border-white/10 z-40 p-5 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <CiSearch size={20} className="text-brand-400" />
            <h2 className="text-base font-bold text-white">Search Users</h2>
          </div>
          <button
            onClick={setOpen}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500 pr-10"
            autoFocus={open}
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {searchResult?.length > 0 ? (
            searchResult.map((u) => (
              <SearchUser
                key={u._id}
                chat={u}
                handleClick={() => accessChat(u._id)}
              />
            ))
          ) : searchResult && searchResult.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No users matching "{search}"
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              Type a name or email to discover colleagues and friends.
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default SideNav;
