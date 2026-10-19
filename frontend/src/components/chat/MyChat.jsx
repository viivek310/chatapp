import React, { useEffect, useState } from 'react';
import { useUser } from '../../../context/userContext';
import { getSender, getSenderInfo, formatMessageTime } from '../../config/util';
import { FaPlus, FaUsers } from "react-icons/fa";
import { BsChatSquareText } from "react-icons/bs";
import { Avatar } from '../common/Avatar';
import GroupModal from '../GroupModal';
import { useNavigate } from 'react-router-dom';

function MyChat() {
  const { user, chats, setChats, setSelectedChat, selectedChat, api, chatOpen, setChatOpen } = useUser();
  const [groupModal, setGroupModal] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchChats = async () => {
    if (!user || !user.token) return;
    setLoading(true);
    try {
      const res = await fetch(`${api}api/chat`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const { data, success, error } = await res.json();

      if (success && Array.isArray(data)) {
        setChats(data);
      } else if (error === "jwt") {
        localStorage.removeItem("userInfo");
        navigate("/");
      }
    } catch (error) {
      console.error("[Fetch Chats Error]:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [user?._id]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setChatOpen(false); // On mobile, close sidebar and open chat box
  };

  const filteredChats = chats.filter((chat) => {
    const name = chat.isGroupChat ? chat?.chatName : getSender(user, chat?.users);
    return name?.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div
      className={`mychats w-full lg:w-80 xl:w-96 glass-panel rounded-2xl h-full flex flex-col text-sm transition-all duration-300 shadow-xl overflow-hidden ${
        !chatOpen ? "hidden lg:flex" : "flex"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-lg text-white">Conversations</h2>
          <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold">
            {chats.length}
          </span>
        </div>

        <button
          onClick={() => setGroupModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-brand-500/20 transition-all active:scale-95"
        >
          <FaPlus size={11} />
          <span>New Group</span>
        </button>
      </div>

      {/* Quick Search inside active chats */}
      <div className="px-4 py-2 border-b border-white/5">
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          placeholder="Filter conversations..."
          className="w-full px-3 py-1.5 rounded-xl glass-input text-xs placeholder:text-slate-500"
        />
      </div>

      {/* Chats List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {loading && chats.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <span className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Loading conversations...</span>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center px-4 text-slate-400">
            <BsChatSquareText size={32} className="text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-300">No conversations yet</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Search for users to start chatting or create a group!
            </p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isSelected = selectedChat?._id === chat._id;
            const chatTitle = chat.isGroupChat ? chat?.chatName : getSender(user, chat?.users);
            const otherUser = !chat.isGroupChat ? getSenderInfo(user, chat?.users) : null;
            const avatarSrc = otherUser?.pic;
            const lastMsg = chat?.latestMessage;

            return (
              <div
                key={chat._id}
                onClick={() => handleSelectChat(chat)}
                className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 border ${
                  isSelected
                    ? "bg-brand-600/20 border-brand-500/50 shadow-md shadow-brand-500/10 text-white"
                    : "bg-slate-900/40 hover:bg-slate-800/60 border-transparent text-slate-300 hover:text-white"
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  {chat.isGroupChat ? (
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white border border-white/10 shadow-sm shadow-cyan-500/10">
                      <FaUsers size={18} />
                    </div>
                  ) : (
                    <Avatar src={avatarSrc} name={chatTitle} className="w-11 h-11" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className="font-semibold text-xs sm:text-sm truncate text-slate-100">
                      {chatTitle}
                    </h3>
                    {lastMsg?.createdAt && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatMessageTime(lastMsg.createdAt)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 truncate">
                    {lastMsg ? (
                      <span>
                        <span className="font-medium text-slate-300">
                          {lastMsg?.sender?._id === user?._id ? "You: " : `${lastMsg?.sender?.name || ""}: `}
                        </span>
                        {lastMsg.content}
                      </span>
                    ) : (
                      <span className="italic text-slate-500">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {groupModal && <GroupModal groupModal={() => setGroupModal(false)} />}
    </div>
  );
}

export default MyChat;
