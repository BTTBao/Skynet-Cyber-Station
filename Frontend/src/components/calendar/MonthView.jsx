import React from 'react'
import {
    format,
    startOfWeek,
    addDays,
    startOfMonth,
    endOfMonth,
    endOfWeek,
    isSameMonth,
    isSameDay
} from 'date-fns'

export const MonthView = ({ currentDate, getBookingsForDate, rooms, onDayClick }) => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const daysOfWeek = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"]

    // Tạo lưới ngày
    const grid = []
    let current = startDate

    while (current <= endDate) {
        const currentCopy = new Date(current)
        const dateKey = format(current, 'yyyy-MM-dd')
        const isToday = isSameDay(current, new Date())
        const isCurrentMonth = isSameMonth(current, monthStart)
        const dayBookings = getBookingsForDate(current)

        grid.push(
            <div
                key={dateKey}
                onClick={() => onDayClick(currentCopy)}
                className={`min-h-[120px] p-2 border-b border-r border-gray-100 relative group transition-colors cursor-pointer hover:bg-indigo-50 ${!isCurrentMonth ? 'bg-gray-50/50' : 'bg-white'
                    }`}
            >
                <div className={`flex justify-between items-center mb-1`}>
                    <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#facb01] text-[#271756]' : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700'
                        }`}>
                        {format(current, 'd')}
                    </span>
                    {dayBookings.length > 0 && (
                        <span className="text-xs font-bold text-gray-400">{dayBookings.length} đơn</span>
                    )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar pointer-events-none">
                    {dayBookings.slice(0, 3).map(b => (
                        <div key={b.id} className="text-[10px] px-1.5 py-1 rounded bg-[#271756]/10 text-[#271756] border-l-2 border-[#271756] truncate">
                            {b.startTime}h: {rooms.find(r => r.id === b.roomId)?.name}
                        </div>
                    ))}
                    {dayBookings.length > 3 && (
                        <div className="text-[10px] text-gray-500 pl-1">+ {dayBookings.length - 3} nữa</div>
                    )}
                </div>
            </div>
        )
        current = addDays(current, 1)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-7 bg-[#271756] text-white">
                {daysOfWeek.map((d, i) => (
                    <div key={i} className="py-3 text-center font-semibold text-sm border-r border-[#271756]/20 last:border-r-0">
                        {d}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 auto-rows-fr">
                {grid}
            </div>
        </div>
    )
}
