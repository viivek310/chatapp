export const getSender = (loggedUser, users = []) => {
  if (!users || users.length === 0) return "Unknown";
  if (users.length === 1) return users[0]?.name || "User";
  return users[0]?._id === loggedUser?._id ? users[1]?.name : users[0]?.name;
};

export const getSenderInfo = (loggedUser, users = []) => {
  if (!users || users.length === 0) return {};
  if (users.length === 1) return users[0];
  return users[0]?._id === loggedUser?._id ? users[1] : users[0];
};

export const getInitials = (name = "") => {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const formatMessageTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const postImage = async (img) => {
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  if (!cloud) {
    console.warn("Cloudinary cloud name is not configured.");
    return null;
  }

  if (img && (img.type === "image/jpeg" || img.type === "image/png" || img.type === "image/webp")) {
    const data = new FormData();
    data.append("file", img);
    data.append("upload_preset", "chat-app");
    data.append("cloud_name", cloud);
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: "POST",
        body: data,
      });
      const urlData = await res.json();
      return urlData.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      return null;
    }
  }
  return null;
};