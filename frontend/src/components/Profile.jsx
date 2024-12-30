import React, { useEffect, useRef } from 'react'
import { RxCross2 } from "react-icons/rx";

function Profile({setProfileOpen,user}) {
  const profileRef = useRef()
  const handleClickOutside = (event) => {
    if (profileRef?.current && !profileRef?.current.contains(event.target)) {
      setProfileOpen(false)
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {  
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={profileRef} className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40svh] w-[30vw] bg-white flex flex-col items-center justify-center p-5 rounded-lg shadow-md cursor-pointer z-20'>
      <div className="userProfile h-40 aspect-square rounded-full overflow-hidden mb-3">
        <img className='h-full w-full object-cover' src={user.pic||""} alt="user profile" />
      </div>
      <div className="username text-2xl font-bold">
        {user.name}
      </div>
      <div className="email">
       Email: {user.email}
      </div>

      <button onClick={setProfileOpen} className='cross absolute top-3 right-3 text-xl '><RxCross2 /></button>
    </div>
  )
}

export default Profile
