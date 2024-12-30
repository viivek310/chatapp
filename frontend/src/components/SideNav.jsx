import React, { useEffect, useRef, useState } from 'react'
import { useUser } from '../../context/userContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { json } from 'react-router-dom';
import SearchUser from './SearchUser';

function SideNav({ open, setOpen }) {
  const sideNav = useRef(null)
  const [search, setSearch] = useState()
  const [searchResult, setSearchResult] = useState()
  const { user,selectedChat,setSelectedChat,chats,setChats,api } = useUser()
  const handleClickOutside = (event) => {
    if (sideNav.current && !sideNav.current.contains(event.target)) {
      setOpen()
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const userSearch = async (e) => {
    e.preventDefault()
    if (search !== "") {
      const res = await fetch(`${api}api/user?search=${search}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      const chatData = await res.json()
      setSearchResult(chatData)
    } else {
      setChats([])
    }
  }

  const searchChange = async (e) => {
    e.preventDefault()
    let srch = e.target.value
    setSearch(e.target.value)
    // console.log(search)
    if (!srch || srch.trim() === "") {
      setSearchResult()
      return
    }
    try {
      const res = await fetch(`${api}api/user?search=${srch.trim()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      let data = await res.json()
      data = data.slice(0,5)
      setSearchResult(data)
    } catch (error) {
      toast.error("Error searching user", {
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

  const accessChat = async(userId)=>{
    setSearch("")
    setSearchResult()
    setOpen()
    
    try {
      const res = await fetch(`${api}api/chat`,{
        method:"POST",
        headers:{
          "content-type":"application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({userId})
      })
      const data = await res.json()
      setSelectedChat(data[0])
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <aside tabIndex={0} ref={sideNav} onClick={handleClickOutside} className={`bg-slate-50 text-black h-screen w-64 fixed ${open ? "inset-0" : "top-0 left-[-100%]"} px-1 py-2 z-20 shadow-md flex flex-col`}>
        <h2 className='text-center mb-3 text-xl font-bold text-slate-900'>Search Users</h2>
        <form onSubmit={userSearch} className='search text-center  flex w-full '>
          <input onChange={searchChange} value={search || ""} className='border border-black focus:outline-none rounded-md  p-1 w-[80%]' type="search" name="" id="" placeholder='search user' required/>
          <button type='submit' className='bg-blue-500 px-2 rounded-md text-white border border-black flex-shrink'>Search</button>
        </form>

        <div className='user-search-box flex-1 mt-3 overflow-y-auto space-y-3'>
          {searchResult?.map(chat => (
            <SearchUser key={chat._id} chat={chat} handleClick={()=>accessChat(chat._id)}/>
          ))}
          {searchResult?.length===0&&<div>No such user found</div>}
        </div>


      </aside>
    </>
  )
}

export default SideNav
