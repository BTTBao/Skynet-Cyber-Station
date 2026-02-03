import React, { useState, useEffect } from "react"
import { UserRole } from "../data/type"
import { X, Loader2 } from "lucide-react" // Nhớ import Loader2
import { DateTimeSelector } from "./booking/DateTimeSelector"
import { BookingSummary } from "./booking/BookingSummary"

// Cấu hình URL API (kiểm tra lại port trong launchSettings.json của Backend)
const API_BASE_URL = "https://localhost:7140/api";

export const BookingModal = ({
    isOpen,
    onClose,
    room,
    currentUser,
    existingBookings,
    onConfirmBooking,
    initialDate,
    initialStartHour
}) => {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    )
    const [startHour, setStartHour] = useState(null)
    const [duration, setDuration] = useState(1)
    const [purpose, setPurpose] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Reset state khi mở Modal
    useEffect(() => {
        if (isOpen) {
            setSelectedDate(initialDate || new Date().toISOString().split("T")[0])
            setStartHour(initialStartHour || null)
            setDuration(1)
            setPurpose("")
            setIsSubmitting(false)
        }
    }, [isOpen, initialDate, initialStartHour])

    if (!isOpen) return null

    // Logic kiểm tra giờ đã đặt trên giao diện
    const getBookedSlots = date => {
        return existingBookings
            .filter(
                b => b.roomId === room.id && b.date === date && b.status !== "REJECTED" && b.status !== "Cancelled"
            )
            .flatMap(b => {
                const slots = []
                for (let i = b.startTime; i < b.endTime; i++) {
                    slots.push(i)
                }
                return slots
            })
    }

    const bookedSlots = getBookedSlots(selectedDate)
    const isSlotAvailable = hour => !bookedSlots.includes(hour)

    const calculateTotal = () => {
        if (currentUser.role === UserRole.LECTURER) return 0
        return room.pricePerHour * duration
    }

    // --- HÀM XỬ LÝ ĐẶT PHÒNG ---
    // --- HÀM XỬ LÝ ĐẶT PHÒNG ---
    const handleBook = async () => {
        if (startHour === null) return

        // 1. Validate Client
        for (let i = 0; i < duration; i++) {
            if (!isSlotAvailable(startHour + i)) {
                alert("Khoảng thời gian bạn chọn đã bị trùng lịch.")
                return
            }
        }

        if (!purpose.trim()) {
            alert("Vui lòng nhập mục đích sử dụng.")
            return
        }

        setIsSubmitting(true)

        // 2. XỬ LÝ NGÀY GIỜ THEO LOCAL TIME (SỬA LỖI SAI GIỜ TẠI ĐÂY)
        // Hàm này tạo chuỗi "YYYY-MM-DDTHH:mm:ss" theo giờ địa phương, không bị đổi sang UTC
        const formatLocalISO = (dateStr, hour) => {
            // dateStr: "2026-02-07"
            // hour: 8
            // Kết quả: "2026-02-07T08:00:00"
            const h = hour.toString().padStart(2, '0');
            return `${dateStr}T${h}:00:00`;
        }

        // Tạo StartTime và EndTime bằng chuỗi thủ công
        const startTimeStr = formatLocalISO(selectedDate, startHour);
        const endTimeStr = formatLocalISO(selectedDate, startHour + duration);

        // 3. Payload
        const bookingPayload = {
            userId: parseInt(currentUser.id || currentUser.userId), 
            // Lưu ý: Sửa lại đoạn lấy ID phòng cho an toàn như đã bàn trước đó
            roomId: parseInt(room.roomId || room.RoomId || room.id),
            bookingDate: selectedDate, // "YYYY-MM-DD"
            purpose: purpose,
            startTime: startTimeStr,   // Gửi chuỗi "2026-02-07T08:00:00"
            endTime: endTimeStr        // Gửi chuỗi "2026-02-07T09:00:00"
        };

        console.log("👉 Payload chuẩn giờ:", bookingPayload);

        try {
            const response = await fetch(`${API_BASE_URL}/RoomBookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingPayload),
            });

            if (response.ok) {
                const newBookingData = await response.json();
                alert(`✅ Đặt phòng thành công!`);
                
                if (onConfirmBooking) {
                    onConfirmBooking(newBookingData);
                }
                onClose();
            } else {
                const errorData = await response.json();
                alert(`❌ Lỗi: ${errorData.message || "Đặt phòng thất bại."}`);
            }
        } catch (error) {
            console.error("Connection Error:", error);
            alert("❌ Lỗi kết nối server.");
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {currentUser.role === UserRole.LECTURER
                                ? "Xác nhận mượn phòng"
                                : "Xác nhận thuê phòng"}
                        </h2>
                        <p className="text-gray-500">{room.name} - {room.roomCode}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 flex-1">
                    <DateTimeSelector
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        startHour={startHour}
                        setStartHour={setStartHour}
                        duration={duration}
                        setDuration={setDuration}
                        purpose={purpose}
                        setPurpose={setPurpose}
                        isSlotAvailable={isSlotAvailable}
                    />

                    {/* Summary & Price */}
                    <BookingSummary
                        currentUser={currentUser}
                        startHour={startHour}
                        duration={duration}
                        calculateTotal={calculateTotal}
                    />
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        disabled={!startHour || !purpose || isSubmitting}
                        onClick={handleBook}
                        className="px-5 py-2.5 bg-[#271756] text-white font-medium rounded-lg hover:bg-[#271756]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#271756]/20 transition-colors flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                        {isSubmitting ? "Đang xử lý..." : `Xác nhận ${currentUser.role === UserRole.LECTURER ? "Mượn" : "Thuê"}`}
                    </button>
                </div>
            </div>
        </div>
    )
}