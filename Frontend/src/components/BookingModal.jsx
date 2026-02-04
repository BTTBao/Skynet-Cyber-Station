import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"; // Import navigate
import { UserRole } from "../data/type"
import { X, Loader2, AlertCircle } from "lucide-react"
import { DateTimeSelector } from "./booking/DateTimeSelector"
import { BookingSummary } from "./booking/BookingSummary"
import { BookingService } from "../services/BookingService"
import { BookingConfig, BookingHelpers } from "../data/bookingConfig"

const API_BASE_URL = "https://localhost:7140/api/client";

export const BookingModal = ({
    isOpen, onClose, room, currentUser, existingBookings, onConfirmBooking, initialDate, initialStartHour
}) => {
    const navigate = useNavigate(); // Hook chuyển trang
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [startHour, setStartHour] = useState(null)
    const [duration, setDuration] = useState(1)
    const [purpose, setPurpose] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState([])
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setSelectedDate(initialDate || new Date().toISOString().split("T")[0])
            setStartHour(initialStartHour || null)
            setDuration(1)
            setPurpose("")
            setIsSubmitting(false)
            setValidationErrors([])
            setIsValidating(false)
        }
    }, [isOpen, initialDate, initialStartHour])

    // Auto-validate khi user thay đổi date/time
    useEffect(() => {
        if (isOpen && startHour !== null && selectedDate) {
            validateSelection()
        }
    }, [selectedDate, startHour, duration])

    if (!isOpen) return null

    // --- VALIDATION FUNCTIONS ---
    const validateSelection = async () => {
        if (!startHour || !selectedDate) return

        setIsValidating(true)
        setValidationErrors([])

        const endHour = startHour + duration
        const userId = parseInt(currentUser.id || currentUser.userId)
        const roomId = parseInt(room.roomId || room.RoomId || room.id)

        try {
            const validation = await BookingService.validateBookingRequest(
                userId, roomId, selectedDate, startHour, endHour, duration
            )

            if (!validation.isValid) {
                setValidationErrors(validation.errors)
            }
        } catch (error) {
            console.error('Lỗi validation:', error)
            setValidationErrors(['Không thể kiểm tra tính hợp lệ. Vui lòng thử lại.'])
        } finally {
            setIsValidating(false)
        }
    }

    // Legacy: Giữ lại cho DateTimeSelector (sẽ cập nhật sau)
    const getBookedSlots = date => {
        return existingBookings
            .filter(b => {
                const bookingDate = b.date || b.bookingDate
                const roomMatches = (b.roomId === room.id || b.roomId === room.roomId)
                const isActive = b.status !== "REJECTED" && b.status !== "Cancelled" && b.status !== "Rejected"
                return roomMatches && bookingDate === date && isActive
            })
            .flatMap(b => {
                const slots = []
                const start = b.startTime || b.startHour
                const end = b.endTime || b.endHour
                for (let i = start; i < end; i++) slots.push(i)
                return slots
            })
    }
    const bookedSlots = getBookedSlots(selectedDate)
    const isSlotAvailable = hour => !bookedSlots.includes(hour)
    const calculateTotal = () => currentUser.role === UserRole.LECTURER ? 0 : room.pricePerHour * duration

    // --- HÀM XỬ LÝ ĐẶT PHÒNG ---
    const handleBook = async () => {
        const token = localStorage.getItem("authToken"); // Hoặc "token" tùy cách bạn lưu lúc login
        if (!token) {
            alert("Vui lòng đăng nhập để đặt phòng!");
            navigate("/login"); // Chuyển về trang login
            return;
        }
        if (startHour === null) {
            alert("Đề nghị chọn giờ bắt đầu!")
            return
        }

        if (!purpose.trim()) {
            alert("Vui lòng nhập mục đích sử dụng phòng!")
            return
        }

        // Kiểm tra validation errors
        if (validationErrors.length > 0) {
            alert("Đặt phòng không thành công:\n" + validationErrors.join('\n'))
            return
        }

        setIsSubmitting(true)

        // Format giờ Local với xử lý cả phút
        const formatLocalISO = (dateStr, decimalHour) => {
            const hours = Math.floor(decimalHour);
            const minutes = Math.round((decimalHour - hours) * 60);
            const h = hours.toString().padStart(2, '0');
            const m = minutes.toString().padStart(2, '0');
            return `${dateStr}T${h}:${m}:00`;
        }

        const payload = {
            userId: parseInt(currentUser.id || currentUser.userId),
            roomId: parseInt(room.roomId || room.RoomId || room.id),
            bookingDate: selectedDate,
            purpose: purpose.trim(),
            startTime: formatLocalISO(selectedDate, startHour),
            endTime: formatLocalISO(selectedDate, startHour + duration)
        };

        try {
            const res = await fetch(`${API_BASE_URL}/RoomBookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });


            if (res.ok) {
                const data = await res.json();
                onClose(); // Đóng modal

                // NẾU CÓ INVOICE ID -> CHUYỂN SANG TRANG CHECKOUT
                if (data.invoiceId) {
                    navigate(`/checkout/${data.invoiceId}`);
                } else {
                    alert("Đặt phòng thành công! Chờ quản trị viên duyệt.");
                    if (onConfirmBooking) onConfirmBooking(data);
                }
            } else {
                const err = await res.json();
                alert(`Lỗi: ${err.message || 'Không thể đặt phòng'}`);
            }
        } catch (error) {
            console.error('Lỗi đặt phòng:', error)
            alert("Lỗi kết nối server. Vui lòng thử lại.");
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
                    {/* Hiển thị validation errors */}
                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-red-800 font-semibold">
                                <AlertCircle size={18} />
                                <span>Không thể đặt phòng</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
                                {validationErrors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isValidating && (
                        <div className="flex items-center justify-center gap-2 text-gray-600 py-2">
                            <Loader2 className="animate-spin" size={16} />
                            <span className="text-sm">Kiểm tra tính khả dụng...</span>
                        </div>
                    )}

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
                        onClick={handleBook}
                        disabled={!startHour || !purpose || isSubmitting || validationErrors.length > 0 || isValidating}
                        className="px-5 py-2.5 bg-[#271756] text-white font-medium rounded-lg hover:bg-[#271756]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting && <Loader2 className="animate-spin w-4 h-4" />}
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    )
}