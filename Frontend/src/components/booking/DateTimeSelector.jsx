import React from "react"
import { Calendar, Clock } from "lucide-react"
import { TIME_SLOTS } from "../../data/constants"
import { BookingConfig, BookingHelpers } from "../../data/bookingConfig"

export const DateTimeSelector = ({
    selectedDate,
    setSelectedDate,
    startHour,
    setStartHour,
    duration,
    setDuration,
    purpose,
    setPurpose,
    isSlotAvailable
}) => {
    // Tách duration thành giờ và phút
    const durationHours = Math.floor(duration)
    const durationMinutes = Math.round((duration - durationHours) * 60)

    const handleHourChange = (hours) => {
        const newDuration = parseInt(hours) + (durationMinutes / 60)
        setDuration(newDuration)
    }

    const handleMinuteChange = (minutes) => {
        const newDuration = durationHours + (parseInt(minutes) / 60)
        setDuration(newDuration)
    }

    return (
        <>
            {/* Date Selection */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Calendar size={18} className="mr-2" /> Ngày đã chọn
                </label>
                <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={e => {
                        setSelectedDate(e.target.value)
                        setStartHour(null)
                    }}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                />
            </div>

            {/* Time Slot Grid */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                    <Clock size={18} className="mr-2" /> Giờ bắt đầu
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {TIME_SLOTS.map(hour => {
                        const isBooked = !isSlotAvailable(hour)
                        const isSelected = startHour === hour

                        // Kiểm tra xem slot đã qua chưa
                        const isPast = BookingHelpers.isPastTime(selectedDate, hour)

                        // Kiểm tra xem có trong giờ làm việc không
                        const isOutsideHours = hour < BookingConfig.OPENING_HOURS.START ||
                            hour >= BookingConfig.OPENING_HOURS.END

                        const isDisabled = isBooked || isPast || isOutsideHours

                        return (
                            <button
                                key={hour}
                                disabled={isDisabled}
                                onClick={() => setStartHour(hour)}
                                className={`
                                    py-2 px-1 text-sm rounded-md transition-all border
                                    ${isDisabled
                                        ? isPast
                                            ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed line-through"
                                            : "bg-red-50 text-red-300 border-red-100 cursor-not-allowed"
                                        : isSelected
                                            ? "bg-[#facb01] text-[#271756] border-[#facb01] shadow-md transform scale-105 font-bold"
                                            : "bg-white text-gray-700 hover:border-[#facb01] hover:bg-[#facb01]/10"
                                    }
                                `}
                            >
                                {hour}:00
                            </button>
                        )
                    })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    🕒 Giờ mở cửa: {BookingConfig.OPENING_HOURS.START}:00 - {BookingConfig.OPENING_HOURS.END}:00
                </p>
            </div>

            {/* Duration - Giờ và Phút trên cùng 1 dòng */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                    Thời lượng
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {/* Select Giờ */}
                    <div>
                        <select
                            value={durationHours}
                            onChange={e => handleHourChange(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                        >
                            {(() => {
                                const options = [];
                                // Tính toán max hours dựa vào startHour
                                const maxHours = startHour
                                    ? BookingConfig.OPENING_HOURS.END - startHour
                                    : 10; // Default 10h nếu chưa chọn giờ

                                for (let h = 0; h <= Math.min(maxHours, 10); h++) {
                                    options.push(
                                        <option key={h} value={h}>
                                            {h} giờ
                                        </option>
                                    );
                                }
                                return options;
                            })()}
                        </select>
                    </div>

                    {/* Select Phút */}
                    <div>
                        <select
                            value={durationMinutes}
                            onChange={e => handleMinuteChange(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                        >
                            <option value={0}>0 phút</option>
                            <option value={15}>15 phút</option>
                            <option value={30}>30 phút</option>
                            <option value={45}>45 phút</option>
                        </select>
                    </div>
                </div>

                {/* Hiển thị giờ kết thúc */}
                {startHour !== null && duration > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                        Kết thúc lúc: <span className="font-semibold text-[#271756]">
                            {(() => {
                                const endHour = startHour + duration;
                                const hours = Math.floor(endHour);
                                const minutes = Math.round((endHour - hours) * 60);
                                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
                            })()}
                        </span>
                        {startHour + duration > BookingConfig.OPENING_HOURS.END && (
                            <span className="text-red-600 ml-2">
                                (⚠️ Vượt giờ đóng cửa!)
                            </span>
                        )}
                    </p>
                )}
            </div>

            {/* Mục đích sử dụng - Dòng riêng */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                    Mục đích sử dụng
                </label>
                <input
                    type="text"
                    value={purpose}
                    onChange={e => setPurpose(e.target.value)}
                    placeholder="VD: Dạy học, Làm đồ án, Nghiên cứu khoa học..."
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                />
            </div>
        </>
    )
}
