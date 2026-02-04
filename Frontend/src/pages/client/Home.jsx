import React, { useEffect, useState } from "react"
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
import { BookingService } from "../../services/BookingService"
import { useNavigate } from "react-router-dom"
import { ReportService } from "../../services/ReportService"

const Home = () => {
    const navigate = useNavigate()

    // 1. CHỈNH SỬA QUAN TRỌNG:
    // Nếu không có localStorage, trả về null (không dùng MOCK_USERS[0] nữa)
    const [currentUser, setCurrentUser] = useState(() => {
        const savedUser = localStorage.getItem("currentUser")
        return savedUser ? JSON.parse(savedUser) : null
    })
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [activeTab, setActiveTab] = useState("rooms")
    const [bookings, setBookings] = useState([])
    const [reports, setReports] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [recommendedRoomIds, setRecommendedRoomIds] = useState([])

    // --- THAY ĐỔI 1: Chuyển myBookings thành State ---
    const [myBookings, setMyBookings] = useState([])

    // Interaction State
    const [viewingRoomDetail, setViewingRoomDetail] = useState(null)
    const [calendarSelectedRoomId, setCalendarSelectedRoomId] = useState("all")
    const [bookingModalRoom, setBookingModalRoom] = useState(null)
    const [bookingModalOpen, setBookingModalOpen] = useState(false)
    const [bookingDraft, setBookingDraft] = useState(null)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [reportingRoom, setReportingRoom] = useState(null)

    // --- THAY ĐỔI 2: Cập nhật useEffect để load dữ liệu ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Chuẩn bị các promise cần gọi
                const promises = [
                    RoomService.getAllRooms(),     // Index 0: Lấy phòng
                    BookingService.getAllBookings() // Index 1: Lấy lịch tổng cho Calendar
                ];

                // Nếu đã đăng nhập, gọi thêm API lấy lịch sử cá nhân
                const userId = currentUser?.id || currentUser?.userId;
                if (userId) {
                    promises.push(BookingService.getBookingHistory(userId)); // Index 2 (nếu có)
                    promises.push(ReportService.getReportsByUserId(userId));
                }

                // Chạy song song
                const results = await Promise.all(promises);

                setRooms(results[0]);
                setBookings(results[1]);

                // Nếu có kết quả thứ 3 (Lịch sử cá nhân) thì set vào state
                if (userId && results[2]) {
                    setMyBookings(results[2]);
                    setReports(results[3] || []);
                } else {
                    setMyBookings([]);
                    setReports([]);
                }

                setError(null);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu hệ thống:', err);
                setError('Không thể tải dữ liệu. Vui lòng kiểm tra kết nối.');
                // Fallback data
                setRooms([]);
                setBookings([]);
                setMyBookings([]);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [currentUser])

    // Handlers
    const handleCalendarNavClick = () => {
        setActiveTab("calendar")
        setCalendarSelectedRoomId("all")
    }

    const handleViewRoomDetail = async (room) => {
        try {
            // Gọi API getRoomDetail để lấy thông tin đầy đủ bao gồm activeIncidentReports
            const detailedRoom = await RoomService.getRoomDetail(room.id);
            setViewingRoomDetail(detailedRoom);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết phòng:', error);
            setViewingRoomDetail(room);
        }
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
        if (!targetRoom && calendarSelectedRoomId === "all") {
            alert("Vui lòng chọn một phòng cụ thể trước khi chọn giờ.")
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

    // Handler confirmBooking cần cập nhật cả 2 state để UI đồng bộ ngay lập tức
    const confirmBooking = (bookingData) => {
        // Tạo object booking giả lập để hiện ngay trên UI mà không cần reload trang
        const newBooking = {
            ...bookingData,
            id: Math.random().toString(36).substr(2, 9),
            status: currentUser?.role === "LECTURER" ? "APPROVED" : "PENDING",
            // Mapping lại field cho khớp với format API lịch sử mới (nếu cần hiển thị ngay)
            startHour: bookingData.startTime,
            endHour: bookingData.endTime,
            roomName: bookingData.roomName || rooms.find(r => r.id === bookingData.roomId)?.name
        }

        // Cập nhật vào lịch tổng (Calendar)
        setBookings(prev => [...prev, newBooking])

        // Cập nhật vào lịch cá nhân (My Bookings)
        setMyBookings(prev => [newBooking, ...prev]) // Đưa lên đầu danh sách

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

    const confirmReport = async (roomId, description) => {
        try {
            // Chuẩn hóa dữ liệu: Ép kiểu Number để tránh lỗi 400 Bad Request
            const reportPayload = {
                userId: Number(currentUser?.id || currentUser?.userId),
                roomId: Number(roomId),
                description: description
            }

            // Gọi API
            await ReportService.createReport(reportPayload);

            // Cập nhật UI ngay lập tức (Optimistic Update)
            // Lưu ý: Tạo title giả lập khớp với logic backend
            const newReportUI = {
                id: Math.random(),
                title: `Sự cố phòng ${roomId}`,
                description: description,
                status: "OPEN",
                timestamp: new Date().toISOString()
            };

            setReports([newReportUI, ...reports]);
            alert("Gửi báo cáo thành công!");
        } catch (error) {
            console.error("Lỗi gửi báo cáo:", error);
            alert("Gửi báo cáo thất bại. Vui lòng thử lại.");
        }
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