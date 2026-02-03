import React, { useState } from "react"
import { MOCK_ROOMS, MOCK_USERS } from "../../data/constants"
import { UserRole } from "../../data/type"
import { BookingModal } from "../../components/BookingModal"
import { ReportModal } from "../../components/ReportModal"
import { RoomCalendar } from "../../components/RoomCalendar"
import { RoomDetailModal } from "../../components/RoomDetailModal"
import { Sidebar } from "../../components/home/Sidebar"
import { RoomsView } from "../../components/home/RoomsView"
import { BookingsView } from "../../components/home/BookingsView"
import { ReportsView } from "../../components/home/ReportsView"
import UserProfile from "./UserProfile"
import { format } from "date-fns"
import { RoomService } from "../../services/RoomService"

const Home = () => {
    const navigate = useNavigate()

    // 1. CHỈNH SỬA QUAN TRỌNG:
    // Nếu không có localStorage, trả về null (không dùng MOCK_USERS[0] nữa)
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser")
        return savedUser ? JSON.parse(savedUser) : null
    })

    const [activeTab, setActiveTab] = useState("rooms")
    // Room data từ API
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // 1. CHỈNH SỬA QUAN TRỌNG:
    // Nếu không có localStorage, trả về null (không dùng MOCK_USERS[0] nữa)
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser")
        return savedUser ? JSON.parse(savedUser) : null
    })

    const [activeTab, setActiveTab] = useState("rooms")
    const [bookings, setBookings] = useState([])
    const [reports, setReports] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [recommendedRoomIds, setRecommendedRoomIds] = useState([])

    // Interaction State
    const [viewingRoomDetail, setViewingRoomDetail] = useState(null)
    const [calendarSelectedRoomId, setCalendarSelectedRoomId] = useState("all")
    const [bookingModalRoom, setBookingModalRoom] = useState(null)
    const [bookingModalOpen, setBookingModalOpen] = useState(false)
    const [bookingDraft, setBookingDraft] = useState(null)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportingRoom, setReportingRoom] = useState(null)

    // Load danh sách phòng từ API khi component mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setLoading(true)
                const data = await RoomService.getAllRooms()
                setRooms(data)
                setError(null)
            } catch (err) {
                console.error('Lỗi khi tải danh sách phòng:', err)
                setError('Không thể tải danh sách phòng. Vui lòng kiểm tra kết nối đến server.')
                setRooms([]) // Fallback về array rỗng
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()
    }, [])

    // Handlers
    const handleCalendarNavClick = () => {
        setActiveTab("calendar")
        setCalendarSelectedRoomId("all")
    }

    const handleViewRoomDetail = room => {
        setViewingRoomDetail(room)
    }

    const handleProceedToCalendar = room => {
        setViewingRoomDetail(null)
        setCalendarSelectedRoomId(room.id)
        setActiveTab("calendar")
    }

    const handleCalendarSlotSelect = (date, hour) => {
        // Chặn nếu chưa đăng nhập
        if (!currentUser) {
            alert("Vui lòng đăng nhập để đặt phòng!")
            navigate("/login")
            return
        }
        let targetRoom = rooms.find(r => r.id === calendarSelectedRoomId)

        let targetRoom = MOCK_ROOMS.find(r => r.id === calendarSelectedRoomId)
        if (!targetRoom && calendarSelectedRoomId === "all") {
            alert("Vui lòng chọn một phòng cụ thể từ menu thả xuống trước khi chọn giờ.")
            return
        }
        if (targetRoom) {
            setBookingDraft({
                date: format(date, "yyyy-MM-dd"),
                hour: hour
            })
            setBookingModalRoom(targetRoom)
            setBookingModalOpen(true)
        }
    }

    const confirmBooking = bookingData => {
        const newBooking = {
            ...bookingData,
            id: Math.random().toString(36).substr(2, 9),
            // Dùng ?. để tránh lỗi nếu currentUser null
            status: currentUser?.role === UserRole.LECTURER ? "APPROVED" : "PENDING"
        }
        setBookings([...bookings, newBooking])
        setActiveTab("bookings")
    }

    const handleReportIssue = room => {
        if (!currentUser) {
            alert("Vui lòng đăng nhập để báo cáo sự cố!")
            return
        }
        setReportingRoom(room)
        setIsReportOpen(true)
    }

    const confirmReport = (roomId, description, aiAnalysis) => {
        const newReport = {
            id: Math.random().toString(36).substr(2, 9),
            roomId,
            userId: currentUser?.id || currentUser?.userId,
            description,
            aiAnalysis,
            severity: aiAnalysis.includes("CAO")
                ? "HIGH"
                : aiAnalysis.includes("TRUNG BÌNH")
                    ? "MEDIUM"
                    : "LOW",
            status: "OPEN",
            timestamp: Date.now()
        }
        setReports([...reports, newReport])
    }

    // 2. XỬ LÝ ĐĂNG XUẤT
    const handleLogout = () => {
        const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất không?")
        if (confirm) {
            localStorage.removeItem("currentUser")
            localStorage.removeItem("authToken")
            // Sau khi logout thì set state về null để giao diện render lại ngay lập tức
            setCurrentUser(null)
            navigate("/login")
        }
    }

    // Filter Logic
    const filteredRooms = rooms.filter(room => {
        if (recommendedRoomIds.length > 0) {
            return recommendedRoomIds.includes(room.id)
        }
        return room.name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    // Chỉ lọc booking nếu có user
    const myBookings = bookings.filter(b => b.userId === (currentUser?.id || currentUser?.userId))

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                myBookingsCount={myBookings.length}
                onCalendarClick={handleCalendarNavClick}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 p-4 sm:px-8 flex justify-between items-center z-10">
                    <h1 className="text-2xl font-bold text-gray-800">
                        {activeTab === "rooms" && "Tìm phòng máy"}
                        {activeTab === "calendar" && "Lịch biểu phòng máy"}
                        {activeTab === "bookings" && "Quản lý lịch đặt"}
                        {activeTab === "reports" && "Lịch sử sự cố"}
                        {activeTab === "profile" && "Hồ sơ cá nhân"}
                    </h1>
                    
                    {/* Chỉ hiện Avatar nếu đã đăng nhập */}
                    {currentUser ? (
                        <div className="md:hidden flex items-center gap-2">
                            <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                        </div>
                    ) : (
                        <button 
                            onClick={() => navigate("/login")}
                            className="md:hidden text-sm text-blue-600 font-semibold"
                        >
                            Đăng nhập
                        </button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-gray-600">Đang tải dữ liệu phòng...</p>
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Lỗi tải dữ liệu</h3>
                                    <p className="mt-1 text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ROOMS VIEW */}
                    {!loading && activeTab === "rooms" && (
                        <RoomsView
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            recommendedRoomIds={recommendedRoomIds}
                            setRecommendedRoomIds={setRecommendedRoomIds}
                            filteredRooms={filteredRooms}
                            currentUserRole={currentUser?.role || "GUEST"} // Fallback role
                            onViewRoomDetail={handleViewRoomDetail}
                        />
                    )}

                    {/* CALENDAR VIEW */}
                    {!loading && activeTab === "calendar" && (
                        <RoomCalendar
                            bookings={bookings}
                            rooms={rooms}
                            preSelectedRoomId={calendarSelectedRoomId}
                            onSelectSlot={handleCalendarSlotSelect}
                        />
                    )}

                    {/* BOOKINGS VIEW - Yêu cầu đăng nhập */}
                    {activeTab === "bookings" && (
                        currentUser ? (
                            <BookingsView
                                myBookings={myBookings}
                                setActiveTab={setActiveTab}
                                onReportIssue={handleReportIssue}
                            />
                        ) : (
                            <div className="text-center mt-10 text-gray-500">
                                Vui lòng đăng nhập để xem lịch đặt của bạn.
                            </div>
                        )
                    )}

                    {/* REPORTS VIEW */}
                    {activeTab === "reports" && <ReportsView reports={reports} />}

                    {/* PROFILE VIEW */}
                    {activeTab === "profile" && (
                        currentUser ? (
                            <UserProfile userId={currentUser.id || currentUser.userId} />
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <p className="text-gray-600">Bạn chưa đăng nhập.</p>
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Đến trang Đăng nhập
                                </button>
                            </div>
                        )
                    )}
                </div>
            </main>

            {/* Modals */}
            {viewingRoomDetail && (
                <RoomDetailModal
                    isOpen={!!viewingRoomDetail}
                    onClose={() => setViewingRoomDetail(null)}
                    room={viewingRoomDetail}
                    userRole={currentUser?.role || "GUEST"}
                    onProceedToBook={handleProceedToCalendar}
                />
            )}

            {bookingModalRoom && (
                <BookingModal
                    isOpen={bookingModalOpen}
                    onClose={() => {
                        setBookingModalOpen(false)
                        setBookingModalRoom(null)
                        setBookingDraft(null)
                    }}
                    room={bookingModalRoom}
                    currentUser={currentUser}
                    existingBookings={bookings}
                    onConfirmBooking={confirmBooking}
                    initialDate={bookingDraft?.date}
                    initialStartHour={bookingDraft?.hour}
                />
            )}

            <ReportModal
                isOpen={isReportOpen}
                onClose={() => {
                    setIsReportOpen(false)
                    setReportingRoom(null)
                }}
                room={reportingRoom}
                onSubmit={confirmReport}
            />
        </div>
    )
}

export default Home