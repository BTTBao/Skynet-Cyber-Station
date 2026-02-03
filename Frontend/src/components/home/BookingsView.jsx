import React from "react"
import { Calendar as CalendarIcon, ShieldAlert } from "lucide-react"
// Bạn nên truyền danh sách phòng thật từ Home xuống, thay vì dùng MOCK_ROOMS
// Nhưng tạm thời giữ import này làm fallback để tránh lỗi import
import { MOCK_ROOMS } from "../../data/constants"

export const BookingsView = ({
    myBookings,
    setActiveTab,
    onReportIssue,
    rooms = [] // Nhận danh sách phòng thật từ props
}) => {
    
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
        <div className="max-w-4xl mx-auto space-y-6">
            {myBookings.map(booking => {
                // 1. Tìm thông tin phòng (Ưu tiên tìm trong rooms thật, fallback về Mock)
                // Lưu ý: Backend trả về roomId là số, cần so sánh lỏng (==) hoặc ép kiểu
                const room = rooms.find(r => r.roomId == booking.roomId) 
                             || MOCK_ROOMS.find(r => r.id == booking.roomId);

                // 2. Xử lý dữ liệu ngày giờ từ API
                // API trả về: bookingDate (string), startTime (ISO string), endTime (ISO string)
                const dateDisplay = booking.bookingDate || booking.date;
                const startHour = getHourFromIso(booking.startTime);
                const endHour = getHourFromIso(booking.endTime);

                // 3. Tính toán lại tổng tiền nếu API không trả về
                // (Giả sử duration = end - start, nhân với giá phòng)
                const duration = endHour - startHour;
                const price = room?.pricePerHour || 0;
                const estimatedCost = booking.totalCost !== undefined 
                                      ? booking.totalCost 
                                      : (duration * price);

                // 4. Xử lý Status (Backend trả về PascalCase: "Approved", Frontend check Upper: "APPROVED")
                const status = booking.status ? booking.status.toUpperCase() : "PENDING";

                return (
                    <div
                        key={booking.bookingId || booking.id} // Dùng bookingId từ API
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="bg-[#271756]/5 p-3 rounded-lg text-[#271756]">
                                <CalendarIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {/* Hiển thị tên phòng (Ưu tiên roomName từ DB) */}
                                    {room?.roomName || room?.name || `Phòng #${booking.roomId}`}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Mục đích: {booking.purpose}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="font-medium text-gray-700">
                                        Ngày: {dateDisplay}
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        Giờ: {startHour}:00 - {endHour}:00
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                    status === "APPROVED"
                                        ? "bg-green-100 text-green-700"
                                        : status === "PENDING"
                                            ? "bg-[#facb01]/20 text-[#271756]"
                                            : "bg-red-100 text-red-700"
                                }`}
                            >
                                {status === "APPROVED"
                                    ? "Đã duyệt"
                                    : status === "PENDING"
                                        ? "Chờ duyệt"
                                        : "Từ chối"}
                            </div>
                            <div className="text-sm font-semibold text-gray-600">
                                Tổng:{" "}
                                {estimatedCost === 0
                                    ? "Miễn phí"
                                    : `${formatCurrency(estimatedCost)} VNĐ`}
                            </div>
                            
                            {/* Nút báo cáo chỉ hiện khi có thông tin phòng */}
                            {room && (
                                <button
                                    onClick={() => onReportIssue(room)}
                                    className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center mt-2"
                                >
                                    <ShieldAlert size={12} className="mr-1" /> Báo cáo sự cố
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}