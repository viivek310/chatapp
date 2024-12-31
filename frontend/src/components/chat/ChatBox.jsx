import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '../../../context/userContext'
import { getSender, getSenderInfo } from '../../config/util'
import { IoMdArrowRoundBack } from "react-icons/io";
import { IoMdMore } from "react-icons/io";
import GroupUpdateModal from '../GroupUpdateModal';
import { io } from "socket.io-client"


const ENDPOINT = "http://localhost:5000/"
var socket, selectedChatCompare

function ChatBox() {
    const { selectedChat, setSelectedChat, user, api, chats ,notification, setNotification} = useUser()
    const [updateChat, setUpdateChat] = useState(false)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)
    const [newMessage, setNewMessage] = useState()
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState()
    const [isTyping, setIsTyping] = useState()
    const scrollcontainer = useRef()


    useEffect(() => {
        socket = io(ENDPOINT)
        socket?.emit("setup", user)
        socket?.on("connected", () => setSocketConnected(true))
        socket?.on("typing", () => setIsTyping(true))
        socket?.on("stop typing", () => setIsTyping(false))
    }, [selectedChat])


    useEffect(() => {
        if (scrollcontainer.current) {
            scrollcontainer.current.scrollTop = scrollcontainer.current.scrollHeight;
        }
    }, [messages, isTyping]);

    // useEffect(() => {
    //   if(newMessage==="")
    //     socket.emit("stop typing",selectedChat._id)
    
    // }, [newMessage])
    

    const fetchMessages = async () => {

        if (!selectedChat) return
       try {
        const res = await fetch(`${api}api/message/${selectedChat?._id}`, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
        const msgs = await res.json()
        setMessages(msgs)
    } catch (error) {
        localStorage.removeItem("userInfo")
    }

        socket?.emit("join chat", selectedChat._id)
    }

    useEffect(() => {
        fetchMessages()
        selectedChatCompare = selectedChat
    }, [selectedChat])

    useEffect(() => {
        const handleMessageReceived = (msg) => {
            if (!selectedChatCompare || selectedChatCompare._id !== msg.chat._id) {
                if(!notification.includes(msg)){
                    setNotification(n=>[msg,...n])  
                }
            } else {
                setMessages(msgs => [...msgs, msg])
            }
        }
        socket.on("message received", handleMessageReceived)

        return () => {
            socket.off("message received", handleMessageReceived)
        }
    }, [])


    const sendText = async (e) => {
        e.preventDefault()
        // console.log(newMessage)
        socket.emit("stop typing", selectedChat._id)
        if (!newMessage) return
        try {
            const res = await fetch(`${api}api/message`, {
                headers: {
                    "Content-type": "application/json",
                    "Accept": "application/json",
                    Authorization: `Bearer ${user.token}`
                },
                method: "POST",
                body: JSON.stringify({
                    content: newMessage,
                    chatId: selectedChat._id
                })
            })

            const newmsg = await res.json()
            socket.emit("new message", newmsg)
            setNewMessage("")
            setMessages(msg => [...msg, newmsg])
        } catch (error) {
            localStorage.removeItem("userInfo")
            toast.error("Error occured while sending chats", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setMessages("")
        }
    }

    const typinghandler = (e) => {
        setNewMessage(e.target.value)

        if (!socketConnected) return

        if (!typing) {
            setTyping(true)
            socket.emit("typing", selectedChat._id)
        }
        let lastTypingTime = new Date().getTime()
        let timerLength = 3000

        setTimeout(() => {
            let timenow1 = new Date().getTime()
            let timediff = timenow1 = lastTypingTime
            if (timediff >= timerLength && typing) {
                socket.emit("stop typing", selectedChat._id)
                setTyping(false)
            }
        }, 5000);
    }
    return (
        <div className="chatbox flex-[3] bg-blue-50">
            {selectedChat ? (
                <div className='bg-slate-200 h-full flex flex-col'>
                    <div className="chatheader px-10 py-2 w-full bg-slate-300 h-[10%] flex items-center text-2xl">
                        <span className='mr-8 cursor-pointer'><IoMdArrowRoundBack /></span>
                        {selectedChat?.isGroupChat ? (
                            <div className="group-header flex justify-between items-center flex-1 ">
                                <div className="name">
                                    {selectedChat?.chatName}
                                </div>
                                <div onClick={() => setUpdateChat(true)} className="group-update cursor-pointer">
                                    <IoMdMore />
                                </div>

                                {updateChat && <span className='text-base fixed'><GroupUpdateModal chat={selectedChat} groupModal={() => setUpdateChat(false)} fetchMessages={fetchMessages} /></span>}
                            </div>


                        ) : (
                            <div className='flex items-center gap-3'>
                                <div className="profile h-10 aspect-square rounded-full overflow-hidden">
                                   
                                    <img className='w-full h-full object-cover' src={getSenderInfo(user,selectedChat?.users).pic || "/images/image.png"} alt="" />
                                </div>
                                <div className="name">{getSender(user, selectedChat?.users)}</div>
                            </div>
                        )}
                    </div>

                    <div className='flex flex-col h-[90%]'>
                        <div ref={scrollcontainer} className="messages  h-[90%] space-y-3 flex flex-col w-full py-3 px-3 overflow-y-scroll scrollbar-thin scrollbar-corner-transparent scrollbar-track-transparent scrollbar-thumb-blue-400">
                            {messages?.map((m, i) => (
                                <div key={m._id} className={`${m?.sender?._id === user?._id && " self-end"} flex items-end`}>
                                    {(m?.sender?._id !== user?._id && (messages[i + 1]?.sender?._id === user?._id || m === messages[messages.length - 1])) ? <div className=' rounded-full h-8 aspect-square overflow-hidden'>
                                        <img className='w-full h-full object-cover' src={getSenderInfo(user, selectedChat?.users)?.pic || "/images/image.png"} alt="" />
                                    </div> : <div className='ml-8'></div>}
                                    <div className={`py-2 px-4  w-fit rounded-full ${m?.sender?._id === user?._id ? "rounded-br-none self-end bg-blue-300" : "rounded-bl-none bg-green-300"}`}>{m?.content}</div>

                                </div>
                            ))}
                            {isTyping &&   <div className={``}>
                                    <div className={`py-2 px-4  w-fit rounded-full rounded-bl-none bg-green-300`}>Typing..</div>
                                </div>}
                        </div>
                        <form className='h-[10%] flex' onSubmit={sendText}>
                            <input onChange={typinghandler} value={newMessage || ""} className='flex-1 rounded-lg border-2 border-blue-500 px-3' type="text" name="" id="" />
                            <button className='bg-slate-700 text-white px-5 rounded-lg'>Send</button>
                        </form>
                    </div>
                </div>

            ) : (
                <div className='h-full w-full grid place-items-center'>Select a user to chat</div>
            )}
        </div>
    )
}

export default ChatBox
