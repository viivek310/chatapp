import React, { useEffect, useRef, useState } from 'react';
import { RxCross2 } from "react-icons/rx";
import { FiCamera } from "react-icons/fi";
import { postImage } from '../config/util';
import { Avatar } from './common/Avatar';
import { useUser } from '../../context/userContext';
import { toast } from 'react-toastify';

function Profile({ setProfileOpen, data }) {
  const [name, setName] = useState(data?.name || '');
  const [image, setImage] = useState(data?.pic || '');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);
  const { api, user, setUser } = useUser();

  const isCurrentUser = user?._id === data?._id;

  const handleClickOutside = (event) => {
    if (!loading && profileRef.current && !profileRef.current.contains(event.target)) {
      setProfileOpen();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [loading]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await postImage(file);
      if (url) {
        setImage(url);
        await updateProfileRequest(name, url);
      } else {
        toast.error("Image upload failed. Please try a valid JPEG or PNG (max 5MB).");
      }
    } catch (err) {
      console.error(err);
      toast.error("Avatar upload failed");
    } finally {
      setLoading(false);
    }
  };

  const updateProfileRequest = async (updatedName = name, updatedImage = image) => {
    setLoading(true);
    try {
      const res = await fetch(`${api}api/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          name: updatedName,
          pic: updatedImage,
        }),
      });

      const { data: updatedData, success } = await res.json();
      if (success) {
        const newInfo = { ...user, name: updatedName, pic: updatedImage };
        localStorage.setItem("userInfo", JSON.stringify(newInfo));
        setUser(newInfo);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div
        ref={profileRef}
        className="w-full max-w-md bg-[#0e1424] rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/10 flex flex-col items-center animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={setProfileOpen}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <RxCross2 size={20} />
        </button>

        {/* Profile Avatar with Camera Trigger */}
        <div className="relative mb-5 group">
          <Avatar
            src={image}
            name={name}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl"
            textClassName="text-3xl"
          />

          {isCurrentUser && (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/30 transition-all border border-slate-900 active:scale-95 cursor-pointer"
                aria-label="Change profile picture"
              >
                <FiCamera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </>
          )}
        </div>

        {/* Name & Details */}
        <div className="w-full text-center space-y-3 mb-6">
          {isEditing ? (
            <div className="max-w-xs mx-auto">
              <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center py-2 px-3 rounded-xl glass-input text-sm font-semibold text-white"
                autoFocus
              />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">{name}</h3>
              <p className="text-xs text-brand-400 font-medium">
                {isCurrentUser ? "You (Owner)" : "Channel Member"}
              </p>
            </div>
          )}

          <div className="py-2 px-4 rounded-xl bg-slate-900/40 border border-white/5 inline-block text-xs text-slate-400">
            <span className="font-medium text-slate-300">Email:</span> {data?.email}
          </div>
        </div>

        {/* Actions */}
        {isCurrentUser && (
          <div className="w-full flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => updateProfileRequest()}
                  disabled={loading}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all"
              >
                Edit Display Name
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
