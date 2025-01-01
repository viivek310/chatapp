import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const UserContext = createContext()

export const UserProvider = ({children})=>{
    const [user, setUser] = useState()
    const [selectedChat, setSelectedChat] = useState()
    const [chats, setChats] = useState([])
    const [api , setApi] = useState()
    const [count,setCount] = useState(1)
    const [notification,setNotification] = useState([])
    const [chatOpen, setChatOpen] = useState(true)
    const navigate = useNavigate();

   useEffect(()=>{
    const backendApi = import.meta.env.VITE_BACKEND_API
    setApi(backendApi)
   },[])

    useEffect(()=>{
       try {
        const data = JSON.parse(localStorage.getItem("userInfo"))
        setUser(data)
        
        if(!data){
            navigate("/")
        }
       } catch (error) {
        localStorage.removeItem("userInfo")
       }

    },[setUser,navigate])
    return (
        <UserContext.Provider value={{user,setUser,selectedChat,setSelectedChat,chats,setChats,api,notification,setNotification,chatOpen,setChatOpen}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = ()=>{
    return useContext(UserContext)
}