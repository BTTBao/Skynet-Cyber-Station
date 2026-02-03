import React from "react"
import { Calendar as CalendarIcon, ShieldAlert } from "lucide-react"
import { MOCK_ROOMS } from "../../data/constants"

export const BookingsView = ({
    myBookings,
    setActiveTab,
    onReportIssue
}) => {
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
                const room = MOCK_ROOMS.find(r => r.id === booking.roomId)
                return (
                    <div
                        key={booking.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                    >
                        <div className="flex items-start space-x-4">
                            <div className="bg-[#271756]/5 p-3 rounded-lg text-[#271756]">
                                <CalendarIcon size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {room?.name || "Phòng không xác định"}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Mục đích: {booking.purpose}
                                </p>
                                <div className="flex gap-4 mt-2 text-sm">
                                    <span className="font-medium text-gray-700">
                                        Ngày: {booking.date}
                                    </span>
                                    <span className="font-medium text-gray-700">
                                        Giờ: {booking.startTime}:00 - {booking.endTime}:00
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2 w-full md:w-auto">
                            <div
                                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${booking.status === "APPROVED"
                                        ? "bg-green-100 text-green-700"
                                        : booking.status === "PENDING"
                                            ? "bg-[#facb01]/20 text-[#271756]"
                                            : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {booking.status === "APPROVED"
                                    ? "Đã duyệt"
                                    : booking.status === "PENDING"
                                        ? "Chờ duyệt"
                                        : "Từ chối"}
                            </div>
                            <div className="text-sm font-semibold text-gray-600">
                                Tổng:{" "}
                                {booking.totalCost === 0
                                    ? "Miễn phí"
                                    : `${booking.totalCost.toLocaleString()} VNĐ`}
                            </div>
                            <button
                                onClick={() => onReportIssue(room)}
                                className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center mt-2"
                            >
                                <ShieldAlert size={12} className="mr-1" /> Báo cáo sự cố
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
