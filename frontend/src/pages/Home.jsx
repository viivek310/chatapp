import React, { useEffect, useState } from 'react'
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext';

const Home = () => {
  const [login, setlogin] = useState(true);
  const [loginData, setLoginData] = useState({});
  const [loginPassView, setLoginPassView] = useState(false)
  const { user,api } = useUser()
  const [signupData, setSignupData] = useState({})
  const [passwordView, setPasswordView] = useState(false)
  const [confirmView, setConfirmView] = useState(false)
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const navigate = useNavigate();


  const validatePassword = (password) => {
    const errors = [];
    if (password?.length < 8) errors.push('Password must be at least 8 characters long.');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter.');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter.');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number.');
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Password must contain at least one special character.');
    return errors;
  };

  const getLoginData = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }
  const getSignupData = (e) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(validatePassword(signupData?.password))
  }
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const ftch = await fetch(`${api}api/user/login`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(loginData)
      })
      const res = await ftch.json()
      if (ftch.ok) {
        localStorage.setItem("userInfo", JSON.stringify(res))
        navigate("/chat")
        setLoginLoading(false)
      } else {
        setLoginLoading(false)
        toast.error(res.message, {
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
    } catch (error) {
      toast.error(error.message, {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setLoginLoading(false)
    }
    // navigate('/chat');
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (signupData.password !== signupData.confirm) {
      toast.error("password do not match", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      setLoading(false)
      console.log("signup failed")
      return
    }
    if (errors?.length === 0) {
      const ftch = await fetch(`${api}api/user`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(signupData)
      })
      const response = await ftch.json()
      if (ftch.ok) {
        toast.success('User registered successfully ', {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        localStorage.setItem("userInfo", JSON.stringify(response))
        navigate('/chat');
      } else {
        toast.error(response.message, {
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
      setLoading(false)
    } else {
      setErrors(validationErrors)
      setLoading(false)
    }

  }

  const postImage = async (img) => {
    setLoading(true)
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
      setSignupData(prev => ({ ...prev, "pic": url.secure_url }))
    }
    setLoading(false)
  }


  useEffect(() => {
    if (user) {
      // console.log(user)
      navigate("/chat")
    }
  }, [navigate,user])

  return (

   !user&& <main className='bg-center bg-blend-darken bg-opacity-80 min-h-[100svh] sm:py-5 '>
      <h1 className='container p-3 m-auto w-full md:w-[80%] text-6xl text-center bg-zinc-900 bg-opacity-70 backdrop-blur-[5px] text-white mb-5 rounded-lg'>v-chat</h1>
      <div className="container m-auto w-[18rem] sm:w-[30rem] bg-zinc-900 border bg-opacity-70 backdrop-blur-[3px] text-white rounded-lg py-10 overflow-hidden relative ">

        <div className="buttons text-center space-x-14 mb-6 text-xl">
          <button onClick={() => setlogin(true)} className={`px-2 py-1 relative z-10 after:rounded-2xl after:-z-10 after:absolute after:top-0 after:left-0  ${login ? "after:translate-x-0 text-black font-bold after:w-full" : "after:translate-x-[115px] after:w-[95px] text-white"} after:transition-all after:ease-out after:duration-500   after:h-full  after:bg-white focus:border-none `}>
            Login
          </button>
          <button className={`${login ? "text-white" : "text-black font-bold"} relative z-20 px-2 py-1 focus:border-none `} onClick={() => setlogin(false)}>Sign up</button>
        </div>

        <div className={` form text-center flex gap-14 sm:gap-[20rem]   ${!login ? "translate-x-[-320px] sm:translate-x-[-561px]" : "translate-x-[7px] sm:translate-x-[79px]"} transition-left duration-500`}>
          <form onSubmit={handleLogin} className='w-[17rem] sm:w-[20rem] shrink-0  space-y-10 ml'>

            <div>
              <input type='email' className='peer focus:outline-none bg-transparent border-b-2 border-white  w-full' name='email' value={loginData.email || ""} placeholder='email' onChange={getLoginData} required />
            </div>


            <div className='relative'>
              <input type={loginPassView ? 'text' : `password`} className='peer focus:outline-none bg-transparent border-b-2 pr-10 border-white w-full' name='password' value={loginData.password || ""} placeholder='password' onChange={getLoginData} required />
              <span onClick={() => setLoginPassView(prev => !prev)} className='absolute right-0 bottom-2 select-none cursor-pointer'>{loginPassView ? <GoEye /> : <GoEyeClosed />}</span>
            </div>


            <button className="button border border-gray-900 rounded-full bg-zinc-900 w-full py-2 grid place-items-center">
              {loginLoading ? <div className='h-5 w-5 rounded-[50%] border border-white border-t-black animate-spin'></div> : "Log in"}
            </button>
          </form>

          <form onSubmit={handleSignup} className='w-[17rem] sm:w-[20rem] mx-auto shrink-0 space-y-10 select-none'>

            <div>
              <input type='text' className='peer focus:outline-none bg-transparent border-b-2 border-white  w-full' name='name' value={signupData.name || ""} placeholder='username' onChange={getSignupData} />
            </div>


            <div>
              <input type='email' className='peer focus:outline-none bg-transparent border-b-2 border-white w-full' name='email' value={signupData.email || ""} placeholder='email' onChange={getSignupData} />
            </div>

            <div className='relative'>
              <input type={passwordView ? "text" : "password"} className='peer focus:outline-none bg-transparent border-b-2 pr-10 border-white w-full' name='password' value={signupData.password || ""} placeholder='password' onChange={getSignupData} />
              <span onClick={() => setPasswordView(prev => !prev)} className='text-white absolute right-0 bottom-2 cursor-pointer '>{passwordView ? <GoEye /> : <GoEyeClosed />}</span>
            </div>

            {errors.length > 0 && <div className='text-red-500'>
              Password must contain at least 8 characters long, one uppercase letter, and one special character.
            </div>}

            <div className='relative'>
              <input type={confirmView ? 'text' : `password`} className='peer focus:outline-none bg-transparent border-b-2 pr-10 border-white w-full' name='confirm' value={signupData.confirm || ""} placeholder='confirm password' onChange={getSignupData} />
              <span onClick={() => setConfirmView(prev => !prev)} className='absolute right-0 bottom-2 select-none cursor-pointer'>{confirmView ? <GoEye /> : <GoEyeClosed />}</span>
            </div>



            <div className='text-start'>
              <label className='text-base '>Upload Your Profile image</label>
              <input type='file' className='peer focus:outline-none bg-transparent border-b-2 border-white w-full text-base ' name='profile' value={signupData.profile} placeholder='Upload Your profile image' accept='image/*' onChange={(e) => setSignupData(postImage(e.target.files[0]))} />
            </div>


            <button className="button border border-gray-900 rounded-full bg-zinc-900 w-full py-2 grid place-items-center">
              {loading ? <div className='h-5 w-5 rounded-[50%] border border-white border-t-black animate-spin'></div> : "Sign up"}
            </button>
          </form>
        </div>
      </div>
      <span className='text-sm'><ToastContainer
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
      /></span>
    </main>
  )
}

export default Home
