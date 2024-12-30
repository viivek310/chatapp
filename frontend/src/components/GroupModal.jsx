import React, { useState } from 'react'
import { RxCross2 } from "react-icons/rx";
import { useUser } from '../../context/userContext';
import SearchUser from './SearchUser';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { IoClose } from "react-icons/io5";

function GroupModal({ groupModal }) {
    const [groupChatName, setGroupChatName] = useState("")
    const { user, api, setChats} = useUser()
    const [searchResult, setSearchResult] = useState([])
    const [selectedUsers, setSelectedUsers] = useState([])

    const handleSearch = async (query) => {
        if (!query||query.trim()==="") {
            setSearchResult([])
            return
        }
        try {
            const res = await fetch(`${api}api/user?search=${query.trim()}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            })
            const data = await res.json()
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

    const handleGroup = (user) => {
        const exit = selectedUsers.find(us=>us._id===user._id)
        if (exit) {
            toast.error('User already selected', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                }); 
            return
        }

        setSelectedUsers(us=>[...us,user])
    }

    const delteUser = (user)=>{
        setSelectedUsers(us=>us.filter(u=>u._id!==user._id))
    }

    const doNothing = (e)=>{
        e.preventDefault()
    }

    const submitGroup = async()=>{
        // console.log()
        if(!groupChatName||selectedUsers.length===0){
            toast.error('Select all the fields', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                }); 
            return
        }

        try {
            const res = await fetch(`${api}api/chat/group`,{
                method: "POST",
                headers:{
                    "Content-Type":"application/json",
                    "Accept":"application/json",
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    name: groupChatName,
                    users: JSON.stringify(selectedUsers.map(u=>u._id))
                })
            })

            const data = await res.json()
            groupModal()
            setChats(c=>[data,...c])

            toast.success(`Group created`, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                toastId:1,
                });
        } catch (error) {
            console.log(error)
            toast.error('Failed to create chat', {
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

    return (
        <div className='h-screen w-sc reen bg fixed inset-0 bg-slate-300 bg-opacity-30 flex justify-center select-none pt-20'>
            <div className='h-fit w-[30vw] transition-height delay-1000 bg-white relative px-10 py-5 rounded-lg'>
                <button onClick={groupModal} className='cross absolute top-2 right-2 text-xl '><RxCross2 /></button>
                <div className="heading text-center text-3xl font-bold mb-5">Creat Group Chat</div>
                <form onSubmit={doNothing} className='space-y-5'>
                    <div>
                        <input className='w-full p-2 rounded-md border border-slate-700' type="text" placeholder='Group Name' value={groupChatName} onChange={(e) => setGroupChatName(e.target.value)} />
                    </div>
                    <div>
                        <input className='w-full p-2 rounded-md border border-slate-700' type="text" placeholder='Search User' onChange={(e) => handleSearch(e.target.value)} />
                    </div>

                    <div className='flex flex-wrap gap-3'>
                        {selectedUsers?.map((user)=>(
                            <div onClick={()=>delteUser(user)} key={user._id} className='flex gap-1 items-center bg-purple-700 text-white p-1 px-2 rounded-full cursor-pointer'>
                                <div className="username">
                                    {user.name}
                                </div>
                                <span>
                                <IoClose />
                                </span>
                            </div>
                        ))}
                    </div>


                    <div className='space-y-2'>
                        {searchResult?.slice(0, 4).map(search => (
                            <SearchUser key={search._id} chat={search} handleClick={() => handleGroup(search)} />
                        ))}
                    </div>


                    <div className="text-end">
                        <button onClick={submitGroup} className='button bg-slate-700 text-white w-fit ml-auto p-2 rounded-lg hover:bg-slate-600 transition-colors duration-300'>Create Group</button>
                    </div>
                </form>
            </div>

            {/* <ToastContainer
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
            /> */}
        </div>
    )
}

export default GroupModal
