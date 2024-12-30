import React from 'react'

function SearchUser({chat,handleClick}) {
    return (
        <div onClick={handleClick} className="user h-16 bg-gray-300 hover:bg-cyan-500 transition-colors duration-300 rounded-md flex items-center cursor-pointer text-sm">
            <div className="img h-[80%] aspect-square rounded-full overflow-hidden mx-2">
                <img className='h-full w-full object-cover' src={chat.pic} alt="" />
            </div>
            <div className="user-info flex-1">
                <div className="userName">
                    {chat.name}
                </div>
                <div className="email">
                    <span className='font-bold'>Email: </span>{chat.email}
                </div>
            </div>
        </div>
    )
}

export default SearchUser
