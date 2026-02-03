import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/client/Home'
import UserProfile from './pages/client/UserProfile'
import Login from './pages/client/Login'
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from './pages/client/Home'
import UserProfile from './pages/client/UserProfile'
import Login from './pages/client/Login'
import ProfileTest from './pages/client/ProfileTest'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profiletest" element={<ProfileTest />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
