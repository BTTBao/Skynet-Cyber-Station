import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"; // Import navigate
import { UserRole } from "../data/type"
import { X, Loader2 } from "lucide-react"
import { DateTimeSelector } from "./booking/DateTimeSelector"
import { BookingSummary } from "./booking/BookingSummary"

const API_BASE_URL = "https://localhost:7140/api";

export const BookingModal = ({
    isOpen, onClose, room, currentUser, existingBookings, onConfirmBooking, initialDate, initialStartHour
}) => {
    const navigate = useNavigate(); // Hook chuyển trang
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [startHour, setStartHour] = useState(null)
    const [duration, setDuration] = useState(1)
    const [purpose, setPurpose] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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

    // Logic tính toán slots (giữ nguyên của bạn)
    const getBookedSlots = date => {
        return existingBookings
            .filter(b => b.roomId === room.id && b.date === date && b.status !== "REJECTED" && b.status !== "Cancelled")
            .flatMap(b => {
                const slots = [];
                for (let i = b.startTime; i < b.endTime; i++) slots.push(i);
                return slots;
            })
    }
    const bookedSlots = getBookedSlots(selectedDate)
    const isSlotAvailable = hour => !bookedSlots.includes(hour)
    const calculateTotal = () => currentUser.role === UserRole.LECTURER ? 0 : room.pricePerHour * duration

    // --- HÀM XỬ LÝ ĐẶT PHÒNG ---
    const handleBook = async () => {
        if (startHour === null) return
        for (let i = 0; i < duration; i++) {
            if (!isSlotAvailable(startHour + i)) {
                alert("Bị trùng lịch rồi!"); return;
            }
        }
        if (!purpose.trim()) { alert("Nhập mục đích đi bạn!"); return; }

        setIsSubmitting(true)

        // Fix giờ Local
        const formatLocalISO = (dateStr, hour) => {
            const h = hour.toString().padStart(2, '0');
            return `${dateStr}T${h}:00:00`;
        }

        const payload = {
            userId: parseInt(currentUser.id || currentUser.userId),
            roomId: parseInt(room.roomId || room.RoomId || room.id),
            bookingDate: selectedDate,
            purpose: purpose,
            startTime: formatLocalISO(selectedDate, startHour),
            endTime: formatLocalISO(selectedDate, startHour + duration)
        };

        try {
            const res = await fetch(`${API_BASE_URL}/RoomBookings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const data = await res.json();
                onClose(); // Đóng modal
                
                // NẾU CÓ INVOICE ID -> CHUYỂN SANG TRANG CHECKOUT
                if (data.invoiceId) {
                    navigate(`/checkout/${data.invoiceId}`);
                } else {
                    alert("Đặt phòng thành công!");
                    if (onConfirmBooking) onConfirmBooking(data);
                }
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message}`);
            }
        } catch (error) {
            alert("Lỗi kết nối server.");
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Xác nhận đặt phòng</h2>
                        <p className="text-gray-500">{room.name}</p>
                    </div>
                    <button onClick={onClose}><X size={24} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-6 flex-1">
                    <DateTimeSelector
                        selectedDate={selectedDate} setSelectedDate={setSelectedDate}
                        startHour={startHour} setStartHour={setStartHour}
                        duration={duration} setDuration={setDuration}
                        purpose={purpose} setPurpose={setPurpose}
                        isSlotAvailable={isSlotAvailable}
                    />
                    <BookingSummary currentUser={currentUser} startHour={startHour} duration={duration} calculateTotal={calculateTotal} />
                </div>
                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg">Hủy bỏ</button>
                    <button 
                        onClick={handleBook} disabled={!startHour || !purpose || isSubmitting}
                        className="px-5 py-2.5 bg-[#271756] text-white font-medium rounded-lg hover:bg-[#271756]/90 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    )
}