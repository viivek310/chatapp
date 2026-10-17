import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUser } from "./userContext";

const SocketContext = createContext(null);

const resolveSocketUrl = () => {
  const backendApi = import.meta.env.VITE_BACKEND_API;
  if (backendApi && backendApi.startsWith("http")) {
    try {
      const url = new URL(backendApi);
      return url.origin;
    } catch (e) {
      return backendApi;
    }
  }
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  return "http://localhost:5000";
};

export const SocketProvider = ({ children }) => {
  const { user, setNotification } = useUser();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingInChat, setTypingInChat] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || !user._id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = resolveSocketUrl();
    const newSocket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("setup", user);
    });

    newSocket.on("connected", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("typing", (room) => {
      setTypingInChat((prev) => ({ ...prev, [room]: true }));
    });

    newSocket.on("stop typing", (room) => {
      setTypingInChat((prev) => ({ ...prev, [room]: false }));
    });

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  const joinChat = (chatId) => {
    if (socketRef.current && isConnected && chatId) {
      socketRef.current.emit("join chat", chatId);
    }
  };

  const emitTyping = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit("typing", chatId);
    }
  };

  const emitStopTyping = (chatId) => {
    if (socketRef.current && chatId) {
      socketRef.current.emit("stop typing", chatId);
    }
  };

  const emitNewMessage = (message) => {
    if (socketRef.current && message) {
      socketRef.current.emit("new message", message);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        emitTyping,
        emitStopTyping,
        emitNewMessage,
        typingInChat,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    return {
      socket: null,
      isConnected: false,
      joinChat: () => {},
      emitTyping: () => {},
      emitStopTyping: () => {},
      emitNewMessage: () => {},
      typingInChat: {},
    };
  }
  return context;
};
