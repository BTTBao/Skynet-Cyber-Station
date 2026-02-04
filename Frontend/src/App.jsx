import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from './pages/client/Home'
import UserProfile from './pages/client/UserProfile'
import AuthPage from './pages/client/AuthPage'
import Checkout from './pages/client/Checkout'
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AccountManagement from './pages/admin/AccountManagement';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';
import InvoiceManagement from './pages/admin/InvoiceManagement';
import IncidentManagement from './pages/admin/IncidentManagement'
import RoomType from './pages/admin/RoomType'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/checkout/:invoiceId" element={<Checkout />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<AuthPage />} />
      </Routes>

      <Routes>
        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="labs" element={<RoomManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="invoices" element={<InvoiceManagement />} />
          <Route path="incidents" element={<IncidentManagement />} />
          <Route path="roomtype" element={<RoomType />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
