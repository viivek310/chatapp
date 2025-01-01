import React, { useEffect, useRef, useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import { FiEdit2 } from "react-icons/fi";
import { postImage } from '../config/util';
import { useUser } from '../../context/userContext';

function Profile({ setProfileOpen, data }) {
  const [name,setName] = useState(data.name)
  const [image,setImage] = useState()
  const [edit,setEdit] = useState(false)
  const profileRef = useRef()
  const {api,user,setUser} = useUser()
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

  const handleImage = async(img)=>{
    const url = await postImage(img)
    setImage(url)
    setUser(u=>({...user,pic:url}))
    localStorage.setItem("userInfo",JSON.stringify({...user,pic:url}))
  }

  const editProfile = async()=>{
    try {
      const res = await fetch(`${api}api/user/update`,{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
          "Accept": "application/json",
           Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name,
          pic:image
        })
      })
      if(res.ok){
        localStorage.setItem("userInfo",JSON.stringify({...user,name}))
        setUser(u=>({...u,name}))
      }
      // console.log(res)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <div ref={profileRef} className='fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-h-[400px] w-[90%] sm:w-[500px] bg-white flex flex-col items-center justify-center p-5 rounded-lg shadow-md cursor-pointer z-20'>
      <div className='flex items-end relative'>
        <div className="userProfile h-40 aspect-square rounded-full overflow-hidden mb-3">
          <img className='h-full w-full object-cover' src={image || "/images/image.png"} alt="user profile" />
        </div>
        <button onClick={()=>setEdit(e=>!e)} className={`mb-3 ${edit?"bg-blue-600":"bg-blue-400"} p-2 text-white rounded-full absolute -right-10 bottom-0`}><FiEdit2 /></button>
      </div>
      <div className={`flex justify-center mb-4 ${!edit&&"hidden"}`}>
        <input onChange={(e)=>handleImage(e.target.files[0])} type="file" />
      </div>
      <div className="username text-2xl font-bold">
        {/* {data.name} */}
        <input disabled={!edit} className={`text-center ${edit?"border border-black":"border-0"} rounded-md focus:outline-none bg-transparent`} value={name} onChange={(e)=>setName(e.target.value)} type="text" />
      </div>
      <div className="email">
        Email: {data.email}
      </div>
      <button onClick={editProfile} className={`bg-slate-600 text-white px-5 py-2 my-3 rounded-lg ${!edit&&"hidden"}`}>Submit</button>

      <button onClick={setProfileOpen} className='cross absolute top-3 right-3 text-xl '><RxCross2 /></button>
    </div>
  )
}

export default Profile
