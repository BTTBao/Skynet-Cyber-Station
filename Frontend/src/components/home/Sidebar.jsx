import React from "react"
import { useNavigate } from "react-router-dom" // 1. Import hook điều hướng
import { UserRole } from "../../data/type"
import { MOCK_USERS } from "../../data/constants"
import {
    LayoutDashboard,
    CalendarDays,
    Calendar as CalendarIcon,
    ShieldAlert,
    User,
    LogOut,
    LogIn // 2. Import thêm icon LogIn
} from "lucide-react"

export const Sidebar = ({
    currentUser,
    setCurrentUser,
    activeTab,
    setActiveTab,
    myBookingsCount,
    onCalendarClick,
    onLogout
}) => {
    // 3. Khai báo hook navigate
    const navigate = useNavigate()

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-20 h-screen sticky top-0">
            {/* --- LOGO --- */}
            <div className="p-6 border-b border-gray-100 flex items-center space-x-3">
                <img
                    src="https://utc2.edu.vn/assets/logo-icon-GCU48TCC.png"
                    alt="UTC2 Logo"
                    className="w-10 h-10 rounded-lg"
                />
                <span className="text-xl font-bold text-[#271756]">UTC2</span>
            </div>

            {/* --- MENU NAV --- */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <button
                    onClick={() => setActiveTab("rooms")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "rooms"
                        ? "bg-[#271756]/10 text-[#271756] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <LayoutDashboard size={20} />
                    <span>Danh sách phòng</span>
                </button>

                <button
                    onClick={onCalendarClick}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "calendar"
                        ? "bg-[#271756]/10 text-[#271756] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <CalendarDays size={20} />
                    <span>Lịch phòng</span>
                </button>

                <button
                    onClick={() => setActiveTab("bookings")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "bookings"
                        ? "bg-[#271756]/10 text-[#271756] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <CalendarIcon size={20} />
                    <span>Lịch đặt của tôi</span>
                    {myBookingsCount > 0 && (
                        <span className="ml-auto bg-[#facb01] text-[#271756] font-bold text-xs px-2 py-0.5 rounded-full">
                            {myBookingsCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab("reports")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "reports"
                        ? "bg-[#271756]/10 text-[#271756] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <ShieldAlert size={20} />
                    <span>Báo cáo sự cố</span>
                </button>

                <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === "profile"
                        ? "bg-[#271756]/10 text-[#271756] font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                        }`}
                >
                    <User size={20} />
                    <span>Thông tin cá nhân</span>
                </button>
            </nav>

            {/* --- FOOTER (XỬ LÝ ĐĂNG NHẬP/ĐĂNG XUẤT) --- */}
            <div className="p-4 border-t border-gray-100">
                {currentUser ? (
                    // === TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP (Hiện thông tin User + Nút Logout) ===
                    <>
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                                Đang đăng nhập:
                            </p>
                            <div className="flex items-center space-x-3 mb-3">
                                <img
                                    src={currentUser.avatar || "https://via.placeholder.com/40"}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {currentUser.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate capitalize">
                                        {currentUser.role === UserRole.LECTURER
                                            ? "Giảng viên"
                                            : currentUser.role === UserRole.STUDENT
                                                ? "Sinh viên"
                                                : "Khách"}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Dropdown đổi vai (Debug) */}
                            <select
                                className="w-full text-xs p-1 border rounded bg-white"
                                onChange={e => {
                                    const user = MOCK_USERS.find(u => u.id === e.target.value)
                                    if (user) setCurrentUser(user)
                                }}
                                value={currentUser.id}
                            >
                                {MOCK_USERS.map(u => (
                                    <option key={u.id} value={u.id}>
                                        Đổi vai: {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                            <LogOut size={16} />
                            <span>Đăng xuất</span>
                        </button>
                    </>
                ) : (
                    // === TRƯỜNG HỢP 2: CHƯA ĐĂNG NHẬP (Chỉ hiện nút Đăng nhập) ===
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-bold shadow-sm"
                    >
                        <LogIn size={18} />
                        <span>Đăng nhập</span>
                    </button>
                )}
            </div>
        </aside>
    )
}