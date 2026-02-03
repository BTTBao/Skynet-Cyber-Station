import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UserProfile from './pages/client/UserProfile.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProfile />
  </StrictMode>,
)
