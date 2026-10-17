import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

const resolveApiBase = () => {
  const envApi = import.meta.env.VITE_BACKEND_API;
  if (envApi) {
    return envApi.endsWith("/") ? envApi : `${envApi}/`;
  }
  return "/";
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo")) || null;
    } catch (e) {
      return null;
    }
  });

  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [api, setApi] = useState(resolveApiBase);
  const [notification, setNotification] = useState([]);
  const [chatOpen, setChatOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setApi(resolveApiBase());
  }, []);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("userInfo"));
      if (data) {
        setUser(data);
      }
    } catch (error) {
      localStorage.removeItem("userInfo");
      setUser(null);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setSelectedChat(null);
    setChats([]);
    setNotification([]);
    navigate("/");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        api,
        notification,
        setNotification,
        chatOpen,
        setChatOpen,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
