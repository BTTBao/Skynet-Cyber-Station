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
import { format } from "date-fns"

const Home = () => {
    // State Management
    const [currentUser, setCurrentUser] = useState(MOCK_USERS[0])
    const [activeTab, setActiveTab] = useState("rooms")

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
    const filteredRooms = MOCK_ROOMS.filter(room => {
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
                    {/* ROOMS VIEW */}
                    {activeTab === "rooms" && (
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
                    {activeTab === "calendar" && (
                        <RoomCalendar
                            bookings={bookings}
                            rooms={MOCK_ROOMS}
                            preSelectedRoomId={calendarSelectedRoomId}
                            onSelectSlot={handleCalendarSlotSelect}
                        />
                    )}

                    {/* BOOKINGS VIEW */}
                    {activeTab === "bookings" && (
                        <BookingsView
                            myBookings={myBookings}
                            setActiveTab={setActiveTab}
                            onReportIssue={handleReportIssue}
                        />
                    )}

                    {/* REPORTS VIEW */}
                    {activeTab === "reports" && <ReportsView reports={reports} />}
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