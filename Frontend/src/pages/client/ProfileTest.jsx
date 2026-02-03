import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Shield, Edit3, Camera,
  LogOut, Settings, CreditCard, FileText, Clock, 
  Lock, Key, Check, X, Eye, EyeOff, AlertCircle,
  ChevronLeft, ChevronRight, Calendar, DollarSign, Filter
} from "lucide-react";

// ==========================================
// 1. MOCK DATA (DỮ LIỆU GIẢ LẬP SỐ LƯỢNG LỚN)
// ==========================================

const generateBookings = () => {
  const statuses = ["Approved", "Pending", "Rejected", "Cancelled", "Completed"];
  const rooms = ["Lab A1", "Hội trường B", "Phòng họp 2", "Studio Media", "Sân bóng", "Thư viện", "Phòng Lab C++"];
  return Array.from({ length: 25 }, (_, i) => ({
    id: 1000 + i,
    roomName: rooms[i % rooms.length],
    date: `2024-${(i % 12) + 1}-0${(i % 9) + 1}`,
    startTime: `${8 + (i % 8)}:00`,
    endTime: `${10 + (i % 8)}:00`,
    status: statuses[i % statuses.length],
    purpose: i % 2 === 0 ? "Dạy học thực hành" : "Tổ chức sự kiện CLB",
    price: i % 3 === 0 ? 0 : 500000
  })).sort((a, b) => b.id - a.id); // Mới nhất lên đầu
};

const generateInvoices = () => {
  const statuses = ["Paid", "Unpaid", "Overdue"];
  return Array.from({ length: 18 }, (_, i) => ({
    id: `INV-${2024000 + i}`,
    createdDate: `2024-${(i % 12) + 1}-15`,
    dueDate: `2024-${(i % 12) + 1}-20`,
    amount: (i + 1) * 250000,
    service: i % 2 === 0 ? "Thuê phòng hội nghị" : "Phí dịch vụ vệ sinh",
    status: statuses[i % statuses.length]
  }));
};

const MOCK_USER = {
  userId: 1,
  username: "nguyenvana",
  fullName: "Nguyễn Văn A",
  email: "nguyenvana@university.edu.vn",
  phoneNumber: "0987654321",
  department: "Khoa Công Nghệ Thông Tin",
  role: { roleName: "Lecturer" },
  isTeacher: true,
  Status: "Active",
  avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  stats: { totalBookings: 25, totalSpent: 12500000, pendingReports: 0 },
  bookings: generateBookings(),
  invoices: generateInvoices()
};

// ==========================================
// 2. HELPER COMPONENTS (Badge, Modal, Pagination)
// ==========================================

// --- Status Badge ---
const StatusBadge = ({ status }) => {
  const configs = {
    Approved: { color: "bg-green-100 text-green-700 border-green-200", icon: Check },
    Completed: { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Check },
    Paid: { color: "bg-green-100 text-green-700 border-green-200", icon: DollarSign },
    Pending: { color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Clock },
    Unpaid: { color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertCircle },
    Rejected: { color: "bg-red-50 text-red-700 border-red-200", icon: X },
    Cancelled: { color: "bg-gray-100 text-gray-600 border-gray-200", icon: X },
    Overdue: { color: "bg-red-100 text-red-800 border-red-200 font-bold", icon: AlertCircle },
    Active: { color: "bg-purple-100 text-purple-700 border-purple-200", icon: Shield },
  };
  const config = configs[status] || configs.Pending;
  const Icon = config.icon;

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1 w-fit ${config.color}`}>
      <Icon size={12} /> {status}
    </span>
  );
};

// --- Pagination Component ---
const Pagination = ({ totalItems, itemsPerPage, currentPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button 
        onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronLeft size={18} />
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
            currentPage === page 
              ? "bg-[#271756] text-white shadow-lg shadow-[#271756]/30 scale-110" 
              : "bg-white text-gray-600 hover:bg-gray-100 border"
          }`}
        >
          {page}
        </button>
      ))}

      <button 
        onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

// --- Change Password Modal ---
const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ current: "", new: "", confirm: "" });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    const [strength, setStrength] = useState(0);

    useEffect(() => {
        if(isOpen) { setStep(1); setFormData({ current: "", new: "", confirm: "" }); setStrength(0); }
    }, [isOpen]);

    useEffect(() => {
        let score = 0;
        const pass = formData.new;
        if (!pass) { setStrength(0); return; }
        if (pass.length > 6) score++;
        if (pass.length > 10) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        setStrength(Math.min(score, 5));
    }, [formData.new]);

    const toggleShow = (f) => setShowPass(p => ({ ...p, [f]: !p[f] }));
    const handleSubmit = (e) => { e.preventDefault(); setTimeout(() => setStep(2), 1000); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="h-2 w-full bg-gradient-to-r from-[#271756] via-purple-500 to-pink-500" />
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Lock className="text-[#271756]" /> Bảo mật</h2>
                        <button onClick={onClose}><X size={20} className="text-gray-500 hover:text-red-500"/></button>
                    </div>
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {['current', 'new', 'confirm'].map((field, idx) => (
                                <div key={field} className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700 capitalize">
                                        {field === 'current' ? 'Mật khẩu cũ' : field === 'new' ? 'Mật khẩu mới' : 'Nhập lại mật khẩu'}
                                    </label>
                                    <div className="relative group">
                                        <input 
                                            type={showPass[field] ? "text" : "password"}
                                            value={formData[field]}
                                            onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#271756] outline-none transition"
                                        />
                                        <button type="button" onClick={() => toggleShow(field)} className="absolute right-3 top-3 text-gray-400">
                                            {showPass[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {field === 'new' && (
                                         <div className="h-1.5 w-full bg-gray-200 rounded-full mt-2 overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(strength/5)*100}%` }} className={`h-full ${strength <= 2 ? 'bg-red-500' : strength <= 4 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                                        </div>
                                    )}
                                </div>
                            ))}
                            <button type="submit" disabled={strength < 3} className="w-full py-3.5 rounded-xl text-white font-bold bg-gradient-to-r from-[#271756] to-[#7f5af0] shadow-lg disabled:opacity-50">Cập nhật</button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><Check size={40} className="text-green-600" /></motion.div>
                            <h3 className="text-xl font-bold">Thành công!</h3>
                            <button onClick={onClose} className="mt-6 px-8 py-2 bg-gray-100 rounded-lg font-medium">Đóng</button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

// ==========================================
// 3. MAIN COMPONENT: USER PROFILE
// ==========================================

const ProfileTest = () => {
  const [activeTab, setActiveTab] = useState("info");
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(MOCK_USER);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Pagination States
  const [bookingPage, setBookingPage] = useState(1);
  const ITEMS_PER_PAGE_BOOKING = 5;

  const [invoicePage, setInvoicePage] = useState(1);
  const ITEMS_PER_PAGE_INVOICE = 6;

  // Derived Data for Pagination
  const indexOfLastBooking = bookingPage * ITEMS_PER_PAGE_BOOKING;
  const currentBookings = user.bookings.slice(indexOfLastBooking - ITEMS_PER_PAGE_BOOKING, indexOfLastBooking);

  const indexOfLastInvoice = invoicePage * ITEMS_PER_PAGE_INVOICE;
  const currentInvoices = user.invoices.slice(indexOfLastInvoice - ITEMS_PER_PAGE_INVOICE, indexOfLastInvoice);

  return (
    <div className="min-h-screen bg-[#F3F4F6] pb-20">
      
      {/* --- HEADER: Parallax & Gradient & Floating Orbs --- */}
      <div className="relative h-80 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#120826] via-[#271756] to-[#6d28d9] animate-gradient-xy"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        
        {/* Animated Orbs */}
        <motion.div 
            animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 right-1/4 w-80 h-80 bg-purple-500 rounded-full blur-[120px] opacity-30"
        />
        <motion.div 
             animate={{ y: [0, 40, 0], x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }}
            className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20"
        />

        {/* Top Buttons */}
        <div className="absolute top-6 right-6 flex gap-3 z-10">
            <button className="p-2.5 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white/20 transition"><Settings size={20} /></button>
            <button className="p-2.5 bg-red-500/80 backdrop-blur-md text-white rounded-full hover:bg-red-600 transition"><LogOut size={20} /></button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/50 backdrop-blur-xl">
          
          {/* --- PROFILE SUMMARY --- */}
          <div className="p-8 pb-0 flex flex-col md:flex-row items-center md:items-end gap-8 relative">
            {/* Avatar */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-40 h-40 rounded-full p-1.5 bg-white shadow-xl">
                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-gray-50" />
                </div>
                <button className="absolute bottom-2 right-2 p-2.5 bg-[#271756] text-white rounded-full hover:scale-110 transition border-2 border-white"><Camera size={18} /></button>
            </div>

            {/* User Details */}
            <div className="flex-1 text-center md:text-left mb-6">
                <h1 className="text-4xl font-black text-gray-900 mb-2">{user.fullName}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center text-gray-500">
                    <span className="bg-[#271756]/5 text-[#271756] px-3 py-1 rounded-full text-sm font-bold border border-[#271756]/10">{user.role.roleName}</span>
                    <span className="flex items-center gap-1 text-sm"><MapPin size={16} /> {user.department}</span>
                    <StatusBadge status={user.Status} />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 mb-6">
                <StatCard label="Tổng đơn" value={user.stats.totalBookings} />
                <StatCard label="Chi tiêu" value={user.stats.totalSpent.toLocaleString('vi-VN', {notation: "compact"})} color="text-green-600" />
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="mt-10 border-b border-gray-200 px-8 flex gap-8 overflow-x-auto hide-scrollbar">
            {['info', 'bookings', 'invoices', 'reports'].map((tab) => (
                <button
                    key={tab} onClick={() => setActiveTab(tab)}
                    className={`pb-4 text-sm font-bold uppercase tracking-wide transition relative ${activeTab === tab ? 'text-[#271756]' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {tab === 'info' && "Thông tin"}
                    {tab === 'bookings' && "Lịch sử đặt phòng"}
                    {tab === 'invoices' && "Hóa đơn"}
                    {tab === 'reports' && "Báo cáo"}
                    {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#271756] rounded-t-full" />}
                </button>
            ))}
          </div>

          {/* --- TAB CONTENT AREA --- */}
          <div className="p-8 bg-gray-50/50 min-h-[600px]">
            <AnimatePresence mode="wait">
                
                {/* 1. INFO TAB */}
                {activeTab === 'info' && (
                    <motion.div key="info" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><User size={24} className="text-[#271756]" /> Hồ sơ cá nhân</h3>
                            <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${isEditing ? 'bg-red-50 text-red-600' : 'bg-white text-[#271756] shadow-sm'}`}>
                                <Edit3 size={16} /> {isEditing ? "Hủy" : "Sửa"}
                            </button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <InfoField icon={<User />} label="Họ tên" value={user.fullName} isEditing={isEditing} />
                            <InfoField icon={<Mail />} label="Email" value={user.email} note="Không thể đổi" />
                            <InfoField icon={<Phone />} label="Số điện thoại" value={user.phoneNumber} isEditing={isEditing} />
                            <InfoField icon={<MapPin />} label="Địa chỉ" value="TP.HCM, Việt Nam" isEditing={isEditing} />
                        </div>
                        
                        {/* Security Section */}
                        <div className="mt-8 bg-[#271756]/5 p-6 rounded-2xl border border-[#271756]/10 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-[#271756] flex items-center gap-2"><Shield size={18}/> Bảo mật</h4>
                                <p className="text-sm text-gray-600 mt-1">Bảo vệ tài khoản của bạn bằng mật khẩu mạnh.</p>
                            </div>
                            <button onClick={() => setIsPasswordModalOpen(true)} className="px-5 py-2.5 bg-[#271756] text-white rounded-xl shadow-lg hover:shadow-[#271756]/40 transition flex items-center gap-2">
                                <Key size={16}/> Đổi mật khẩu
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 2. BOOKINGS TAB (LIST VIEW) */}
                {activeTab === 'bookings' && (
                    <motion.div key="bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Lịch sử đặt phòng ({user.bookings.length})</h3>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"><Filter size={16}/> Lọc</button>
                        </div>

                        <div className="space-y-4">
                            {currentBookings.map((item, index) => (
                                <motion.div 
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-[#271756]/30 hover:shadow-md transition-all group flex flex-col md:flex-row gap-4 items-center"
                                >
                                    {/* Date Box */}
                                    <div className="bg-gray-50 p-3 rounded-lg text-center min-w-[80px] group-hover:bg-[#271756] group-hover:text-white transition-colors">
                                        <div className="text-xs font-medium uppercase">{new Date(item.date).toLocaleString('default', { month: 'short' })}</div>
                                        <div className="text-2xl font-bold">{new Date(item.date).getDate()}</div>
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 w-full text-center md:text-left">
                                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 text-lg">{item.roomName}</h4>
                                            <span className="text-xs text-gray-400">#{item.id}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center justify-center md:justify-start gap-4">
                                            <span className="flex items-center gap-1"><Clock size={14}/> {item.startTime} - {item.endTime}</span>
                                            <span className="flex items-center gap-1"><DollarSign size={14}/> {item.price > 0 ? item.price.toLocaleString() : 'Miễn phí'}</span>
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1 italic line-clamp-1">{item.purpose}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="min-w-[120px] flex justify-end">
                                        <StatusBadge status={item.status} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        
                        <Pagination 
                            totalItems={user.bookings.length} 
                            itemsPerPage={ITEMS_PER_PAGE_BOOKING} 
                            currentPage={bookingPage} 
                            onPageChange={setBookingPage} 
                        />
                    </motion.div>
                )}

                {/* 3. INVOICES TAB (TABLE VIEW) */}
                {activeTab === 'invoices' && (
                    <motion.div key="invoices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Danh sách hóa đơn ({user.invoices.length})</h3>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-200">
                                        <tr>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Mã HĐ</th>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Dịch vụ</th>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Ngày tạo</th>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Tổng tiền</th>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Trạng thái</th>
                                            <th className="p-5 text-xs font-bold text-gray-400 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {currentInvoices.map((inv, index) => (
                                            <motion.tr 
                                                key={inv.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50/80 transition-colors"
                                            >
                                                <td className="p-5 font-semibold text-[#271756]">{inv.id}</td>
                                                <td className="p-5 font-medium text-gray-800">{inv.service}</td>
                                                <td className="p-5 text-sm text-gray-500">{inv.createdDate}</td>
                                                <td className="p-5 text-right font-bold text-gray-900">{inv.amount.toLocaleString()} đ</td>
                                                <td className="p-5 flex justify-center"><StatusBadge status={inv.status} /></td>
                                                <td className="p-5 text-right">
                                                    <button className="text-sm text-purple-600 hover:underline font-medium">Chi tiết</button>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Pagination 
                            totalItems={user.invoices.length} 
                            itemsPerPage={ITEMS_PER_PAGE_INVOICE} 
                            currentPage={invoicePage} 
                            onPageChange={setInvoicePage} 
                        />
                    </motion.div>
                )}

                {/* 4. REPORTS TAB */}
                {activeTab === 'reports' && (
                     <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-gray-100 p-5 rounded-full mb-4"><Shield size={48} className="text-gray-400" /></div>
                        <h3 className="text-xl font-bold text-gray-800">Chưa có báo cáo nào</h3>
                        <p className="text-gray-500 max-w-sm mt-2">Hệ thống ghi nhận bạn chưa gửi báo cáo sự cố nào gần đây.</p>
                        <button className="mt-6 px-6 py-2 bg-[#271756] text-white rounded-lg shadow-lg hover:bg-[#3d2485] transition flex items-center gap-2">
                            <FileText size={18} /> Tạo báo cáo mới
                        </button>
                    </motion.div>
                )}

            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isPasswordModalOpen && <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
};

// --- Helper Func ---
const StatCard = ({ label, value, color = "text-[#271756]" }) => (
    <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer min-w-[120px] text-center">
        <div className={`text-2xl font-black ${color}`}>{value}</div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
);

const InfoField = ({ icon, label, value, isEditing, note }) => (
    <div className="group">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">{label}</label>
        <div className="relative">
            <div className="absolute left-3 top-3 text-gray-400 group-hover:text-[#271756] transition">{icon}</div>
            {isEditing && !note ? (
                <input type="text" defaultValue={value} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#271756] outline-none transition font-medium text-gray-800" />
            ) : (
                <div className="w-full pl-10 py-2.5 font-semibold text-gray-800 border border-transparent">{value}</div>
            )}
        </div>
        {note && <p className="text-xs text-red-400 mt-1 italic pl-1">{note}</p>}
    </div>
);

export default ProfileTest;