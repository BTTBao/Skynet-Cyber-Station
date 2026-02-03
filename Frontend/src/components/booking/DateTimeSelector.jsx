import React from "react"
import { Calendar, Clock } from "lucide-react"
import { TIME_SLOTS } from "../../data/constants"

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
                        return (
                            <button
                                key={hour}
                                disabled={isBooked}
                                onClick={() => setStartHour(hour)}
                                className={`
                  py-2 px-1 text-sm rounded-md transition-all border
                  ${isBooked
                                        ? "bg-red-50 text-red-300 border-red-100 cursor-not-allowed decoration-slice"
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
            </div>

            {/* Duration & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Thời lượng (giờ)
                    </label>
                    <select
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                    >
                        {[1, 2, 3, 4, 5, 6].map(h => (
                            <option key={h} value={h}>
                                {h} tiếng
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                        Mục đích sử dụng
                    </label>
                    <input
                        type="text"
                        value={purpose}
                        onChange={e => setPurpose(e.target.value)}
                        placeholder="VD: Dạy học, Làm đồ án..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] outline-none"
                    />
                </div>
            </div>
        </>
    )
}
