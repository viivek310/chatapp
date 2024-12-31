import React, { useEffect, useState } from 'react'
import { useUser } from '../../../context/userContext'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSender } from '../../config/util';
import { FaPlus } from "react-icons/fa";
import GroupModal from '../GroupModal';
import { useNavigate } from 'react-router-dom';


function MyChat() {
    const { user, chats, setChats, setSelectedChat, selectedChat,api } = useUser()
    const [groupModal, setGroupModal] = useState(false  )
    const {chatOpen,setChatOpen} = useUser()
    const navigate = useNavigate()


    const fetchChats = async () => {
        try {
            const res = await fetch(`${api}api/chat`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })

            const chatData = await res.json()
            // if(res.status!==200){
            //     console.log("not authorised")
            //     localStorage.removeItem("userInfo")
            //     navigate("/")
            // }
         
            setChats(chatData)
        } catch (error) {
            // localStorage.removeItem("userInfo")
            // navigate("/")
            console.log(error)
            toast.error("Error fetching chats", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
        }
    }


    useEffect(() => {
        fetchChats();
    }, [setChats, selectedChat])

    const chatControl = (chat)=>{
       setSelectedChat(chat)
       setChatOpen(false)
    }
    return (
        <div className={`mychats flex-1 ${!chatOpen&&"hidden"} lg:block bg-zinc-100 h-full flex flex-col text-sm`}>
            <div className='flex justify-between items-center p-5'>
                <h3 className=' font-bold text-xl text-slate-700'>My chats</h3>
                <div className="addbtn">
                    <button onClick={()=>setGroupModal(true)} className='bg-slate-300  p-2 rounded-md flex gap-3 items-center shadow-md'>New Group Chat <span><FaPlus /></span></button>
                </div>
            </div>

            <div className="chats space-y-3 overflow-y-auto flex-1 px-5">
                {chats.length===0&&<div className='text-center'>
                        No chats to show
                    </div>}
                {chats?.map(chat => (
                    <div onClick={()=>chatControl(chat)} key={chat._id} className='bg-gray-500 hover:bg-cyan-500 transition-colors duration-300 text-white rounded-md p-2 cursor-pointer'>
                        <div>
                            {chat.isGroupChat ? chat?.chatName : getSender(user, chat?.users)}
                        </div>
                        {console.log(chat?.latestMessage)}
                        <div>{chat?.latestMessage&&`${chat?.latestMessage?.sender?.name}: ${chat?.latestMessage?.content}`}</div>
                        {/* {chat.users[0].name} */}
                    </div>
                ))}
            </div>

            {groupModal&&<GroupModal groupModal={()=>setGroupModal(false)}/>}

            <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </div>
    )
}

export default MyChat
