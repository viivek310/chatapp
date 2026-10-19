import React, { useState } from "react";
import { getInitials } from "../../config/util";

export const Avatar = ({
  src,
  name = "User",
  className = "w-10 h-10",
  textClassName = "text-sm",
  alt,
}) => {
  const [imageError, setImageError] = useState(false);

  // If there's an image src and it hasn't errored, try rendering it
  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || name}
        onError={() => setImageError(true)}
        className={`${className} rounded-xl object-cover shrink-0 border border-white/10`}
      />
    );
  }

  // Fallback to stylized initials badge
  const initials = getInitials(name);
  return (
    <div
      className={`${className} rounded-xl shrink-0 bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 border border-white/10 flex items-center justify-center text-white font-bold select-none shadow-sm shadow-brand-500/20`}
      title={name}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  );
};

export default Avatar;
