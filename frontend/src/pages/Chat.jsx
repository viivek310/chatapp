import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import { useUser } from '../../context/userContext'
import MyChat from '../components/chat/MyChat'
import ChatBox from '../components/chat/ChatBox'
import Profile from '../components/Profile'



const Chat = () => {
  const { user } = useUser()
  const [profileOpen, setProfileOpen] = useState()
  const [profileUser,setProfileUser] = useState(user)

  useEffect(() => {
    setProfileUser(user)
  }, [user])
  
  return (
    user && <div className={`${profileOpen ? "before:content-[''] before:h-screen before:w-screen before:absolute before:inset-0 before:bg-slate-200 before:bg-opacity-30 before:z-10 relative" : ""}`}
    >
      {profileOpen && <Profile setProfileOpen={() => setProfileOpen(false)} data={profileUser} />}
      <Navbar open={() => setProfileOpen(prev => !prev)} />
      <main className='flex gap-3 p-4 h-[92vh]'>
        <MyChat />
        <ChatBox setUser={setProfileUser} open={() => setProfileOpen(prev => !prev)}/>
      </main>
    </div>
  )
}

export default Chat
