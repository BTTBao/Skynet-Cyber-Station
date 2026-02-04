import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/client/Home'
import UserProfile from './pages/client/UserProfile'
import Login from './pages/client/Login'
import Checkout from './pages/client/Checkout'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout/:invoiceId" element={<Checkout />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
