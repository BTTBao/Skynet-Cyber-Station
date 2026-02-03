import React, { useState, useEffect } from "react"
import { UserRole } from "../data/type"
import { X } from "lucide-react"
import { DateTimeSelector } from "./booking/DateTimeSelector"
import { BookingSummary } from "./booking/BookingSummary"

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

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedDate(initialDate || new Date().toISOString().split("T")[0])
            setStartHour(initialStartHour || null)
            setDuration(1)
            setPurpose("")
        }
    }, [isOpen, initialDate, initialStartHour])

    if (!isOpen) return null

    const getBookedSlots = date => {
        return existingBookings
            .filter(
                b => b.roomId === room.id && b.date === date && b.status !== "REJECTED"
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

    const handleBook = () => {
        if (startHour === null) return

        // Validate continuous block
        for (let i = 0; i < duration; i++) {
            if (!isSlotAvailable(startHour + i)) {
                alert(
                    "Khoảng thời gian bạn chọn đã bị trùng lịch. Vui lòng kiểm tra lại."
                )
                return
            }
        }

        onConfirmBooking({
            roomId: room.id,
            userId: currentUser.id,
            userName: currentUser.name,
            date: selectedDate,
            startTime: startHour,
            endTime: startHour + duration,
            totalCost: calculateTotal(),
            purpose
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {currentUser.role === UserRole.LECTURER
                                ? "Xác nhận mượn phòng"
                                : "Xác nhận thuê phòng"}
                        </h2>
                        <p className="text-gray-500">{room.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-500" />
                    </button>
                </div>

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

                <div className="p-6 border-t bg-white sticky bottom-0 z-10 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        disabled={!startHour || !purpose}
                        onClick={handleBook}
                        className="px-5 py-2.5 bg-[#271756] text-white font-medium rounded-lg hover:bg-[#271756]/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#271756]/20 transition-colors"
                    >
                        Xác nhận {currentUser.role === UserRole.LECTURER ? "Mượn" : "Thuê"}
                    </button>
                </div>
            </div>
        </div>
    )
}
