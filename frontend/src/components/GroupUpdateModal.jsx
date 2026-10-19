import React, { useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { useUser } from '../../context/userContext';
import SearchUser from './SearchUser';
import { toast } from 'react-toastify';
import { IoClose } from "react-icons/io5";
import { FaUsers, FaUserShield } from "react-icons/fa";

function GroupUpdateModal({ groupModal, chat, fetchMessages }) {
  const [groupChatName, setGroupChatName] = useState("");
  const { user, api, setChats, selectedChat, setSelectedChat } = useUser();
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = selectedChat?.groupAdmin?._id === user?._id;

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

  const handleAddUser = async (u) => {
    if (selectedChat?.users?.some((item) => item._id === u._id)) {
      toast.info('User is already in this channel');
      return;
    }

    if (!isAdmin) {
      toast.error('Only channel administrators can add members');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat/groupadd`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          userId: u._id,
        }),
      });

      const { data, success, message } = await res.json();
      if (success && data) {
        setSelectedChat(data);
        if (fetchMessages) fetchMessages();
        toast.success(`Added ${u.name} to channel`);
      } else {
        toast.error(message || "Failed to add member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (u) => {
    if (!isAdmin && u._id !== user._id) {
      toast.error('Only channel administrators can remove members');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat/groupremove`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          userId: u._id,
        }),
      });

      const { data, success, message } = await res.json();
      if (success) {
        if (u._id === user._id) {
          // If the user left the group themselves
          setSelectedChat(null);
          setChats((prev) => prev.filter((c) => c._id !== selectedChat._id));
          groupModal();
          toast.info("You left the channel.");
        } else {
          setSelectedChat(data);
          if (fetchMessages) fetchMessages();
          toast.success(`Removed ${u.name}`);
        }
      } else {
        toast.error(message || "Failed to remove member");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error removing member");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!groupChatName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat/rename`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          chatId: selectedChat._id,
          chatName: groupChatName.trim(),
        }),
      });

      const { data, success, message } = await res.json();
      if (success && data) {
        setSelectedChat(data);
        setChats((prev) =>
          prev.map((c) => (c._id === data._id ? { ...c, chatName: data.chatName } : c))
        );
        setGroupChatName("");
        toast.success("Channel renamed successfully!");
      } else {
        toast.error(message || "Error updating group name");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to rename channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none text-left">
      <div className="w-full max-w-lg bg-[#0e1424] rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={groupModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <RxCross2 size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <FaUsers size={18} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{chat?.chatName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-brand-300">
              <FaUserShield size={12} />
              <span>Admin: {selectedChat?.groupAdmin?.name || "Group Admin"}</span>
            </div>
          </div>
        </div>

        {/* Channel Members List Chips */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Channel Members ({selectedChat?.users?.length || 0})
          </label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto py-1">
            {selectedChat?.users?.map((u) => {
              const isMemberAdmin = u._id === selectedChat?.groupAdmin?._id;
              return (
                <span
                  key={u._id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-white/10 text-xs font-medium text-slate-200"
                >
                  <span>{u.name}</span>
                  {isMemberAdmin ? (
                    <span className="text-[10px] text-amber-400 font-bold ml-1">(Admin)</span>
                  ) : (
                    isAdmin && (
                      <button
                        onClick={() => handleRemoveUser(u)}
                        className="hover:text-red-400 transition-colors ml-1"
                        title="Remove member"
                      >
                        <IoClose size={13} />
                      </button>
                    )
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Rename Form (Admin or Member) */}
        <form onSubmit={handleRename} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="New channel name..."
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={!groupChatName.trim() || loading}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-40"
          >
            Rename
          </button>
        </form>

        {/* Add Members (Admin Only) */}
        {isAdmin && (
          <div className="space-y-2 mb-6">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Add New Member
            </label>
            <input
              type="search"
              placeholder="Search user..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500"
            />

            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {searchResult?.slice(0, 3).map((u) => (
                <SearchUser
                  key={u._id}
                  chat={u}
                  handleClick={() => handleAddUser(u)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Leave Group Action */}
        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            {isAdmin ? "Admin actions enabled" : "Standard member"}
          </span>
          <button
            type="button"
            onClick={() => handleRemoveUser(user)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white text-xs font-semibold transition-all active:scale-95"
          >
            Leave Channel
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupUpdateModal;
