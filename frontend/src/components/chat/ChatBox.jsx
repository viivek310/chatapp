import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '../../../context/userContext';
import { useSocket } from '../../context/SocketContext';
import { getSender, getSenderInfo, formatMessageTime } from '../../config/util';
import { IoMdArrowRoundBack, IoMdMore } from "react-icons/io";
import { IoSend } from "react-icons/io5";
import { BsChatDots, BsShieldCheck } from "react-icons/bs";
import GroupUpdateModal from '../GroupUpdateModal';
import { Avatar } from '../common/Avatar';
import { toast } from 'react-toastify';

function ChatBox({ open, setUser }) {
  const { selectedChat, setSelectedChat, user, api, chatOpen, setChatOpen, setNotification } = useUser();
  const { socket, isConnected, joinChat, emitTyping, emitStopTyping, emitNewMessage, typingInChat } = useSocket();

  const [updateChat, setUpdateChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const scrollContainerRef = useRef(null);
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const fetchMessages = async () => {
    if (!selectedChat?._id || !user?.token) return;

    setLoading(true);
    try {
      const res = await fetch(`${api}api/message/${selectedChat._id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const { success, data, error } = await res.json();
      if (success && Array.isArray(data)) {
        setMessages(data);
      } else if (error === "jwt") {
        localStorage.removeItem("userInfo");
      }
    } catch (err) {
      console.error("[Fetch Messages Error]:", err);
    } finally {
      setLoading(false);
    }

    joinChat(selectedChat._id);
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedChat?._id]);

  // Listen for incoming messages on persistent socket
  useEffect(() => {
    if (!socket) return;

    const handleMessageReceived = (msg) => {
      const currentChat = selectedChatRef.current;
      if (!currentChat || currentChat._id !== msg.chat?._id) {
        // Message is for another chat: add to notifications
        setNotification((prev) => {
          if (!prev.some((n) => n._id === msg._id)) {
            return [msg, ...prev];
          }
          return prev;
        });
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("message received", handleMessageReceived);

    return () => {
      socket.off("message received", handleMessageReceived);
    };
  }, [socket]);

  // Auto-scroll on new message or typing
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, typingInChat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat?._id) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    emitStopTyping(selectedChat._id);
    setIsTypingLocal(false);

    try {
      const res = await fetch(`${api}api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          content: messageText,
          chatId: selectedChat._id,
        }),
      });

      const { data, success } = await res.json();

      if (success && data) {
        emitNewMessage(data);
        setMessages((prev) => [...prev, data]);
      } else {
        toast.error("Message could not be sent.");
      }
    } catch (error) {
      console.error("[Send Message Error]:", error);
      toast.error("Failed to send message.");
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isConnected || !selectedChat?._id) return;

    if (!isTypingLocal) {
      setIsTypingLocal(true);
      emitTyping(selectedChat._id);
    }

    const lastTypingTime = new Date().getTime();
    const timerLength = 2500;

    setTimeout(() => {
      const timeNow = new Date().getTime();
      const timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && isTypingLocal) {
        emitStopTyping(selectedChat._id);
        setIsTypingLocal(false);
      }
    }, timerLength);
  };

  const openProfile = () => {
    if (!selectedChat?.isGroupChat && setUser) {
      const otherUser = getSenderInfo(user, selectedChat?.users);
      setUser(otherUser);
      open();
    }
  };

  const otherUser = !selectedChat?.isGroupChat ? getSenderInfo(user, selectedChat?.users) : null;
  const chatTitle = selectedChat?.isGroupChat ? selectedChat?.chatName : getSender(user, selectedChat?.users);
  const isPeerTyping = selectedChat?._id && typingInChat[selectedChat._id];

  return (
    <div
      className={`chatbox flex-1 glass-panel rounded-2xl h-full flex flex-col shadow-2xl overflow-hidden ${
        chatOpen ? "hidden lg:flex" : "flex"
      }`}
    >
      {selectedChat ? (
        <div className="h-full flex flex-col">
          {/* Chat Header */}
          <div className="h-16 px-4 sm:px-6 border-b border-white/10 bg-slate-900/60 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChatOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Back to conversations"
              >
                <IoMdArrowRoundBack size={22} />
              </button>

              <div
                onClick={openProfile}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <Avatar
                    src={otherUser?.pic}
                    name={chatTitle}
                    className="w-10 h-10"
                  />
                  {!selectedChat.isGroupChat && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-brand-300 transition-colors">
                    {chatTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedChat.isGroupChat
                      ? `${selectedChat.users?.length || 0} participants`
                      : "Direct Channel"}
                  </p>
                </div>
              </div>
            </div>

            {selectedChat.isGroupChat && (
              <div className="relative">
                <button
                  onClick={() => setUpdateChat(true)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
                  aria-label="Group settings"
                >
                  <IoMdMore size={22} />
                </button>

                {updateChat && (
                  <GroupUpdateModal
                    chat={selectedChat}
                    groupModal={() => setUpdateChat(false)}
                    fetchMessages={fetchMessages}
                  />
                )}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3"
          >
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                <span className="inline-block w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading conversation history...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <BsChatDots size={36} className="text-slate-600" />
                <p className="text-xs">No messages yet. Send a friendly hello!</p>
              </div>
            ) : (
              messages.map((m, i) => {
                const isMyMessage = m?.sender?._id === user?._id;
                const showAvatar =
                  !isMyMessage &&
                  (i === messages.length - 1 || messages[i + 1]?.sender?._id !== m?.sender?._id);

                return (
                  <div
                    key={m._id || i}
                    className={`flex items-end gap-2 ${isMyMessage ? "justify-end" : "justify-start"}`}
                  >
                    {!isMyMessage && (
                      <div className="w-7 h-7 shrink-0">
                        {showAvatar ? (
                          <Avatar
                            src={m?.sender?.pic}
                            name={m?.sender?.name || "U"}
                            className="w-7 h-7"
                            textClassName="text-[10px]"
                          />
                        ) : (
                          <div className="w-7 h-7" />
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm break-words shadow-md transition-all ${
                        isMyMessage
                          ? "bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-br-xs"
                          : "bg-slate-800/90 text-slate-100 border border-white/10 rounded-bl-xs"
                      }`}
                    >
                      {selectedChat.isGroupChat && !isMyMessage && (
                        <p className="text-[10px] font-semibold text-brand-300 mb-0.5">
                          {m?.sender?.name}
                        </p>
                      )}

                      <p className="leading-relaxed">{m?.content}</p>

                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isMyMessage ? "text-indigo-200" : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(m?.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isPeerTyping && (
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-2xl rounded-bl-none bg-slate-800/80 border border-white/10 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 typing-dot" />
                </div>
              </div>
            )}
          </div>

          {/* Message Input Bar */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-slate-900/60 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl glass-input text-xs sm:text-sm placeholder:text-slate-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium shadow-md shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                <IoSend size={16} />
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Empty Welcome State */
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600/30 to-indigo-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-glow mb-2">
            <BsChatDots size={30} />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Your Real-Time Messaging Space
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            Select a contact from the sidebar or click search to start a new private or group chat.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-2">
            <BsShieldCheck className="text-emerald-400" />
            <span>End-to-end synchronized via Socket.IO</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatBox;
