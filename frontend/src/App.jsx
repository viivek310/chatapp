import { useState } from 'react'
import { BrowserRouter, Route , Routes } from 'react-router-dom'
import Home from './pages/Home'
import Chat from './pages/Chat'
import notfound from './pages/notfound'
import { UserProvider } from '../context/userContext'


function App() {

  return (
    <>
      <BrowserRouter>
        <UserProvider>
        <Routes>
          <Route path='/' Component={Home} exact/>
          <Route path='/chat' Component={Chat}/>
          <Route path='*' Component={notfound}/>
        </Routes>
        </UserProvider>
      </BrowserRouter>
    </>
  )
}

export default App

