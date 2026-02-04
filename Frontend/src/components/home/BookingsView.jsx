import React, { useState } from "react"
import { Calendar as CalendarIcon, ShieldAlert, QrCode, X, AlertCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
// Bạy nên truyền danh sách phòng thật từ Home xuống, thay vì dùng MOCK_ROOMS
// Nhưng tạm thời giữ import này làm fallback để tránh lỗi import
import { MOCK_ROOMS } from "../../data/constants"

export const BookingsView = ({
    myBookings,
    setActiveTab,
    onReportIssue,
    rooms = [] // Nhận danh sách phòng thật từ props
}) => {
    const [showQRModal, setShowQRModal] = useState(false)
    const [selectedBookingForQR, setSelectedBookingForQR] = useState(null)

    // Helper format tiền tệ an toàn
    const formatCurrency = (amount) => {
        return (amount || 0).toLocaleString('vi-VN');
    }

    // Helper tính giờ từ chuỗi ISO (2024-02-07T10:00:00) -> 10
    const getHourFromIso = (isoString) => {
        if (!isoString) return 0;
        return new Date(isoString).getHours();
    }

    if (myBookings.length === 0) {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <CalendarIcon
                        size={48}
                        className="mx-auto text-gray-300 mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                        Chưa có lịch đặt nào
                    </h3>
                    <p className="text-gray-500 mb-6">
                        Hãy tìm phòng và đặt lịch ngay hôm nay.
                    </p>
                    <button
                        onClick={() => setActiveTab("rooms")}
                        className="px-4 py-2 bg-[#271756] text-white rounded-lg hover:bg-[#271756]/90 transition-colors"
                    >
                        Đặt phòng ngay
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
            {myBookings.map(booking => {
                // 1. Tìm thông tin phòng (Ưu tiên tìm trong rooms thật, fallback về Mock)
                // Lưu ý: Backend trả về roomId là số, cần so sánh lỏng (==) hoặc ép kiểu
                const room = rooms.find(r => r.roomId == booking.roomId)
                    || MOCK_ROOMS.find(r => r.id == booking.roomId);

                // 2. Xử lý dữ liệu ngày giờ từ API
                // API trả về: bookingDate (string), startTime (ISO string), endTime (ISO string)
                const dateDisplay = booking.bookingDate || booking.date;

                // 3. Tính toán lại tổng tiền nếu API không trả về
                // (Giả sử duration = end - start, nhân với giá phòng)
                const duration = booking.duration || 0;
                const price = booking?.basePrice || 0;
                const estimatedCost = (duration * price);

                // 4. Xử lý Status (Backend trả về PascalCase: "Pending", "Booked", "Rejected", "InUse", "Completed")
                const status = booking.status ? booking.status.toUpperCase() : "PENDING";

                // Helper để lấy màu và text cho từng status
                const getStatusDisplay = (status) => {
                    switch (status) {
                        case "PENDING":
                            return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Chờ duyệt" }
                        case "APPROVED":
                            return {
                                bg: booking.isUsed ? "bg-green-100" : "bg-blue-100",
                                text: booking.isUsed ? "text-green-700" : "text-blue-700",
                                label: booking.isUsed ? "Đang sử dụng" : "Đã đặt"
                            }
                        case "REJECTED":
                            return { bg: "bg-red-100", text: "text-red-700", label: "Từ chối" }
                        case "COMPLETE":
                            return { bg: "bg-green-100", text: "text-green-700", label: "Hoàn thành" }
                        default:
                            return { bg: "bg-gray-100", text: "text-gray-700", label: status }
                    }
                }

                const statusDisplay = getStatusDisplay(status);

                // Handler để mở QR modal
                const handleShowQR = () => {
                    setSelectedBookingForQR(booking)
                    setShowQRModal(true)
                };

                return (
                    <div
                        key={booking.bookingId || booking.id} // Dùng bookingId từ API
                        className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5 md:p-7 flex flex-col md:flex-row items-start md:items-start justify-between gap-5 md:gap-6"
                    >
                        <div className="flex items-start space-x-4 md:space-x-5 flex-1">
                            <div className="bg-[#271756]/10 p-3.5 rounded-xl text-[#271756] shrink-0">
                                <CalendarIcon size={24} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-3">
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">
                                    {/* Hiển thị tên phòng (Ưu tiên roomName từ DB) */}
                                    {booking?.roomName}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    <span className="font-medium text-gray-700">Mục đích:</span> {booking.purpose}
                                </p>
                                {/* HIỂN THỊ LÝ DO TỪ CHỐI --- */}
                                {status === "REJECTED" && (
                                    <div className="flex items-start gap-2.5 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">
                                            <span className="font-semibold">Lý do từ chối: </span>
                                            {/* Xử lý null/empty string */}
                                            {booking.rejectionReason ? booking.rejectionReason : "Không có lý do cụ thể"}
                                        </span>
                                    </div>
                                )}
                                {/* Ngày giờ */}
                                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">📅</span>
                                        <span className="font-semibold text-gray-900">{dateDisplay}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">🕒</span>
                                        <span className="font-semibold text-gray-900">{booking.startTimeStr} - {booking.endTimeStr}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider - chỉ hiện trên mobile */}
                        <div className="w-full h-px bg-gray-200 md:hidden"></div>

                        {/* Right sidebar - Status và Actions */}
                        <div className="flex flex-col items-end space-y-3 w-full md:w-auto md:min-w-[180px]">
                            <div
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${statusDisplay.bg} ${statusDisplay.text} shadow-sm`}
                            >
                                {statusDisplay.label}
                            </div>

                            {/* Tổng tiền */}
                            <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                <div className="text-xs text-gray-500 mb-0.5">Tổng tiền</div>
                                <div className="text-base font-bold text-gray-900">
                                    {estimatedCost === 0
                                        ? "Miễn phí"
                                        : `${formatCurrency(estimatedCost)} ₫`}
                                </div>
                            </div>

                            {/* Nút Check-in QR khi status là Booked */}
                            {(status === "APPROVED" && booking.isUsed == false) && (
                                <button
                                    onClick={handleShowQR}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#271756] text-white rounded-lg hover:bg-[#271756]/90 transition-all hover:shadow-md text-sm font-semibold w-full md:w-auto"
                                >
                                    <QrCode size={18} />
                                    Check-in
                                </button>
                            )}

                            {/* Nút báo cáo chỉ hiện khi có thông tin phòng và đang sử dụng */}
                            {room && (status === "APPROVED" && booking.isUsed == true) && (
                                <button
                                    onClick={() => onReportIssue(room)}
                                    className="flex items-center justify-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors w-full md:w-auto font-medium"
                                >
                                    <ShieldAlert size={14} /> Báo cáo sự cố
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}

            {/* QR Code Modal - Responsive */}
            {showQRModal && selectedBookingForQR && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 md:p-8 relative my-8">
                        {/* Close button */}
                        <button
                            onClick={() => setShowQRModal(false)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <X size={20} className="sm:w-6 sm:h-6" />
                        </button>

                        {/* Modal content */}
                        <div className="text-center space-y-4 sm:space-y-6">
                            <div className="pt-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                                    Check-in
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm px-2">
                                    Đưa mã QR này cho admin để quét và check-in
                                </p>
                            </div>

                            {/* QR Code - Responsive size */}
                            <div className="flex justify-center">
                                <div className="bg-white p-4 sm:p-6 rounded-xl border-2 border-gray-200 inline-block">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            bookingId: selectedBookingForQR.bookingId || selectedBookingForQR.id,
                                            action: "checkin",
                                            roomId: selectedBookingForQR.roomId,
                                            userId: selectedBookingForQR.userId,
                                            timestamp: new Date().toISOString()
                                        })}
                                        size={window.innerWidth < 640 ? 160 : 200}
                                        level="H"
                                        includeMargin={true}
                                    />
                                </div>
                            </div>

                            {/* Booking info - Responsive padding and text */}
                            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-left space-y-2">
                                <div className="text-xs sm:text-sm flex flex-wrap items-baseline">
                                    <span className="text-gray-600 min-w-[80px] sm:min-w-[90px]">Phòng:</span>
                                    <span className="font-semibold text-gray-900 flex-1">
                                        {selectedBookingForQR.roomName}
                                    </span>
                                </div>
                                <div className="text-xs sm:text-sm flex flex-wrap items-baseline">
                                    <span className="text-gray-600 min-w-[80px] sm:min-w-[90px]">Ngày:</span>
                                    <span className="font-semibold text-gray-900 flex-1">
                                        {selectedBookingForQR.bookingDate || selectedBookingForQR.date}
                                    </span>
                                </div>
                                <div className="text-xs sm:text-sm flex flex-wrap items-baseline">
                                    <span className="text-gray-600 min-w-[80px] sm:min-w-[90px]">Giờ:</span>
                                    <span className="font-semibold text-gray-900 flex-1">
                                        {selectedBookingForQR.startTimeStr} - {selectedBookingForQR.endTimeStr}
                                    </span>
                                </div>
                                <div className="text-xs sm:text-sm flex flex-wrap items-baseline">
                                    <span className="text-gray-600 min-w-[80px] sm:min-w-[90px]">Booking ID:</span>
                                    <span className="font-mono font-semibold text-gray-900 flex-1 break-all">
                                        #{selectedBookingForQR.bookingId || selectedBookingForQR.id}
                                    </span>
                                </div>
                            </div>

                            {/* Instructions - Responsive text */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                <p className="text-[10px] sm:text-xs text-blue-800 text-left">
                                    💡 <strong>Hướng dẫn:</strong> Admin sẽ quét mã QR này để xác nhận check-in.
                                    Sau khi quét thành công, trạng thái booking sẽ tự động chuyển sang "Đang sử dụng".
                                </p>
                            </div>

                            {/* Close button - Responsive padding */}
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}