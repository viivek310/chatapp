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
  if (!img) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(img.type)) {
    console.warn("Unsupported image type:", img.type);
    return null;
  }

  const data = new FormData();
  data.append("image", img);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const resData = await res.json();
    if (resData.success && resData.url) {
      return resData.url;
    } else {
      console.error("Local upload error:", resData.message);
      return null;
    }
  } catch (err) {
    console.error("Local upload failed:", err);
    return null;
  }
};