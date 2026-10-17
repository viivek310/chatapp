import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useUser } from '../../context/userContext';
import MyChat from '../components/chat/MyChat';
import ChatBox from '../components/chat/ChatBox';
import Profile from '../components/Profile';

const Chat = () => {
  const { user } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(user);

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-dark-bg text-slate-100 select-none">
      {profileOpen && (
        <Profile
          setProfileOpen={() => setProfileOpen(false)}
          data={profileUser}
        />
      )}

      <Navbar setUser={setProfileUser} open={() => setProfileOpen((prev) => !prev)} />

      <main className="flex-1 flex gap-3 p-2 sm:p-4 overflow-hidden max-w-[1600px] w-full mx-auto">
        <MyChat />
        <ChatBox
          setUser={setProfileUser}
          open={() => setProfileOpen((prev) => !prev)}
        />
      </main>
    </div>
  );
};

export default Chat;
