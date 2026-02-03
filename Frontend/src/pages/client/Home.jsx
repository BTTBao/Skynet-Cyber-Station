import React, { useState, useEffect } from "react"
import { MOCK_USERS } from "../../data/constants"
import { UserRole } from "../../data/type"
import { BookingModal } from "../../components/BookingModal"
import { ReportModal } from "../../components/ReportModal"
import { RoomCalendar } from "../../components/RoomCalendar"
import { RoomDetailModal } from "../../components/RoomDetailModal"
import { Sidebar } from "../../components/home/Sidebar"
import { RoomsView } from "../../components/home/RoomsView"
import { BookingsView } from "../../components/home/BookingsView"
import { ReportsView } from "../../components/home/ReportsView"
import { format } from "date-fns"
import { RoomService } from "../../services/RoomService"

const Home = () => {
    // State Management
    const [currentUser, setCurrentUser] = useState(MOCK_USERS[0])
    const [activeTab, setActiveTab] = useState("rooms")

    // Room data từ API
    const [rooms, setRooms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [bookings, setBookings] = useState([])
    const [reports, setReports] = useState([])

    const [searchQuery, setSearchQuery] = useState("")
    const [recommendedRoomIds, setRecommendedRoomIds] = useState([])

    // Interaction State
    const [viewingRoomDetail, setViewingRoomDetail] = useState(null)
    const [calendarSelectedRoomId, setCalendarSelectedRoomId] = useState("all")

    // Booking Flow State
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
        let targetRoom = rooms.find(r => r.id === calendarSelectedRoomId)

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
            status: currentUser.role === UserRole.LECTURER ? "APPROVED" : "PENDING"
        }
        setBookings([...bookings, newBooking])
        setActiveTab("bookings")
    }

    const handleReportIssue = room => {
        setReportingRoom(room)
        setIsReportOpen(true)
    }

    const confirmReport = (roomId, description, aiAnalysis) => {
        const newReport = {
            id: Math.random().toString(36).substr(2, 9),
            roomId,
            userId: currentUser.id,
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

    // Filter Logic
    const filteredRooms = rooms.filter(room => {
        if (recommendedRoomIds.length > 0) {
            return recommendedRoomIds.includes(room.id)
        }
        return room.name.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const myBookings = bookings.filter(b => b.userId === currentUser.id)

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
                    </h1>
                    <div className="md:hidden flex items-center gap-2">
                        <img src={currentUser.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                    </div>
                </header>

                {/* Content Body */}
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
                            currentUserRole={currentUser.role}
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

                    {/* BOOKINGS VIEW */}
                    {!loading && activeTab === "bookings" && (
                        <BookingsView
                            myBookings={myBookings}
                            setActiveTab={setActiveTab}
                            onReportIssue={handleReportIssue}
                            rooms={rooms}
                        />
                    )}

                    {/* REPORTS VIEW */}
                    {!loading && activeTab === "reports" && <ReportsView reports={reports} rooms={rooms} />}
                </div>
            </main>

            {/* Room Detail Modal */}
            {viewingRoomDetail && (
                <RoomDetailModal
                    isOpen={!!viewingRoomDetail}
                    onClose={() => setViewingRoomDetail(null)}
                    room={viewingRoomDetail}
                    userRole={currentUser.role}
                    onProceedToBook={handleProceedToCalendar}
                />
            )}

            {/* Booking Modal (Confirmation) */}
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

            {/* Report Modal */}
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