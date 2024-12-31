import React, { useEffect, useRef, useState } from 'react'
import { CiSearch } from "react-icons/ci";
import SideNav from './SideNav';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';
import { IoChevronDown, IoNotifications } from "react-icons/io5";
import { Button, Popover } from "flowbite-react";



function Navbar({ open }) {
  const [sideNavOpen, setSideNavOpen] = useState(false)
  const [contextMenuOpen, setContextMenuOpen] = useState(false)
  const { notification,setSelectedChat,setNotification } = useUser()
  const contextMenu = useRef()
  const parentDiv = useRef()
  const { user, count } = useUser()
  const navigate = useNavigate()


  // const content = (
  //   <div className="w-64 text-sm text-gray-500 dark:text-gray-400">
  //     <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
  //       <h3 className="font-semibold text-gray-900 dark:text-white">Notification</h3>
  //     </div>
  //     <div className="px-3 py-2">
  //       <p>And here's some amazing content. It's very engaging. Right?</p>
  //     </div>
  //   </div>
  // );

  const handleLogOut = () => {
    localStorage.removeItem("userInfo")
    navigate("/")
  }

  const handleClickOutside = (event) => {
    if (contextMenu.current && !contextMenu.current.contains(event.target) && parentDiv.current && !parentDiv.current.contains(event.target)) {
      // if(contextMenuOpen)
      setContextMenuOpen(false)
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notificationClick = (n)=>{
    setSelectedChat(n?.chat)
    setNotification(notifications=>notifications.filter(no=>no!==n))
  }

  return (
    <nav className='w-full bg-slate-900 bg-opacity-80 backdrop-blur-[2px] text-white shadow-md h-12 flex items-center justify-between px-5 select-none'>
      <SideNav open={sideNavOpen} setOpen={() => setSideNavOpen(false)} />
      <div onClick={() => setSideNavOpen(true)} className="search px-2 sm:px-0 sm:w-28 h-7 bg-white text-black border border-black rounded-md flex items-center cursor-pointer text-2xl sm:text-base">
        <CiSearch />
        <span className='hidden sm:block'>Search user</span>
      </div>

      <h1 className='text-3xl font-bold cursor-pointer select-none'>V-chat</h1>


      <div className='flex gap-2 lg:gap-5 items-center'>

        <div className="flex gap-2">

          {/* <Popover content={content} trigger="click">
            <button className={`text-3xl relative`}>
              <IoNotifications />
              <span className='h-4 w-4 bg-red-600 rounded-full absolute top-0 right-0 flex justify-center items-center text-sm'>{notification.length}</span>

              <div className='absolute text-black text-lg bg-red-500 w-[300px] left-1/2 -translate-x-1/2 -bottom-10 z-20'>
                {notification?.map(n => (
                  <div className='border-t border-b'>{n?.sender?.name} sent a message</div>
                ))}
              </div>
            </button>

          </Popover> */}

          <Popover
            aria-labelledby="default-popover"
            content={
              <div className="w-64 text-sm text-gray-500 dark:text-gray-400 ">
                <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
                  <h3 id="default-popover" className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                </div>
                <div className="">
                  {notification?.map(n=>(
                    <div className='text-black font-bold cursor-pointer hover:bg-slate-100 transition-colors duration-300 px-3 py-2 rounded-lg' onClick={()=>notificationClick(n)}>{n?.sender?.name} sent you a message</div>
                  ))}
                  {notification.length===0&&<div>No Notifications</div>}
                </div>
              </div>
            }
            arrow={false}
          >
            <button className={`text-3xl relative`}>
              <IoNotifications />
              <span className='h-4 w-4 bg-red-600 rounded-full absolute top-0 right-0 flex justify-center items-center text-sm'>{notification.length}</span>
            </button>
          </Popover>
        </div>

        <div ref={parentDiv} onClick={() => setContextMenuOpen(prev => !prev)} className="profile flex items-center bg-white text-black px-3 rounded-md cursor-pointer relative">
          <div className="profile-img h-10 w-10 rounded-full overflow-hidden">
            <img className='w-full h-full object-cover' src={user?.pic} />
          </div>
          <div className="username mx-2 hidden sm:block">
            {user?.name}
          </div>
          <div>{count}</div>
          <div className="icon">
            <IoChevronDown />
          </div>



          {contextMenuOpen && <div tabIndex={0} ref={contextMenu} className="contextMenu w-full  bg-red-600 absolute left-0 top-16 rounded-md overflow-hidden text-white">
            <div onClick={open} className="col1 py-2 text-center bg-neutral-800 border border-b-neutral-500 hover:bg-neutral-700">
              Profile
            </div>

            <div onClick={handleLogOut} className="col1 py-2 text-center bg-neutral-800 border border-b-white hover:bg-neutral-700">
              Logout
            </div>
            <div>{count}</div>
          </div>}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
