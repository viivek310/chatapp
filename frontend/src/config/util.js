export const getSender = (user,users)=>{
    return users[0]?._id===user._id?users[1]?.name:users[0]?.name
}


export const getSenderInfo = (user,users)=>{
     return users[0]?._id===user._id?users[1]:users[0]
}


export const postImage = async (img) => {
    // setLoading(true)
    const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (img.type === "image/jpeg" || img.type === "image/png") {
      const data = new FormData()
      data.append("file", img)
      data.append("upload_preset", "chat-app")
      data.append("cloud_name", cloud)
      const ftch = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: data,
      })
      const url = await ftch.json()
      return url.secure_url
    }
    // setLoading(false)
  }