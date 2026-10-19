import React, { useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { useUser } from '../../context/userContext';
import SearchUser from './SearchUser';
import { toast } from 'react-toastify';
import { IoClose } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";

function GroupModal({ groupModal }) {
  const [groupChatName, setGroupChatName] = useState("");
  const { user, api, setChats, setSelectedChat } = useUser();
  const [searchResult, setSearchResult] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResult([]);
      return;
    }

    try {
      const res = await fetch(`${api}api/user?search=${query.trim()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const { data, success } = await res.json();
      if (success && Array.isArray(data)) {
        setSearchResult(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = (u) => {
    if (selectedUsers.some((item) => item._id === u._id)) {
      toast.info('User already added to group list');
      return;
    }
    setSelectedUsers((prev) => [...prev, u]);
  };

  const handleDeleteUser = (u) => {
    setSelectedUsers((prev) => prev.filter((item) => item._id !== u._id));
  };

  const submitGroup = async (e) => {
    e.preventDefault();
    if (!groupChatName.trim()) {
      toast.warn('Please enter a group name.');
      return;
    }

    if (selectedUsers.length < 2) {
      toast.warn('Please add at least 2 other members.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: groupChatName.trim(),
          users: JSON.stringify(selectedUsers.map((u) => u._id)),
        }),
      });

      const { data, success, message } = await res.json();

      if (success && data) {
        setChats((prev) => [data, ...prev]);
        setSelectedChat(data);
        toast.success(`Group "${groupChatName}" created!`);
        groupModal();
      } else {
        toast.error(message || 'Failed to create group');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error creating group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0e1424] rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={groupModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <RxCross2 size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <FaUsers size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Create Group Channel</h2>
            <p className="text-xs text-slate-400">Assemble a team or group discussion</p>
          </div>
        </div>

        <form onSubmit={submitGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Channel Name
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering Team"
              value={groupChatName}
              onChange={(e) => setGroupChatName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Add Members
            </label>
            <input
              type="search"
              placeholder="Search user by name or email..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
            />
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 py-1 max-h-24 overflow-y-auto">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  onClick={() => handleDeleteUser(u)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-300 text-xs font-medium cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-colors"
                >
                  <span>{u.name}</span>
                  <IoClose size={14} />
                </span>
              ))}
            </div>
          )}

          {/* Search results dropdown */}
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {searchResult?.slice(0, 4).map((searchUser) => (
              <SearchUser
                key={searchUser._id}
                chat={searchUser}
                handleClick={() => handleSelectUser(searchUser)}
              />
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
            <button
              type="button"
              onClick={groupModal}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-brand-500/25 transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Channel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GroupModal;
