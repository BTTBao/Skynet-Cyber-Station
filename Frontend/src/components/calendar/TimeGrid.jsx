import React from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { MousePointerClick } from 'lucide-react'
import { TIME_SLOTS } from '../../data/constants'

export const TimeGrid = ({ type, currentDate, getBookingsForDate, rooms, onSlotClick }) => {
    const startDate = type === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : currentDate
    const daysToShow = type === 'week' ? 7 : 1
    const days = []

    for (let i = 0; i < daysToShow; i++) {
        days.push(addDays(startDate, i))
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            {/* Header Grid */}
            <div className="flex border-b border-gray-200">
                <div className="w-16 border-r border-gray-200 flex-shrink-0 bg-gray-50"></div>
                <div className={`flex-1 grid grid-cols-${daysToShow} divide-x divide-gray-200`}>
                    {days.map((day, i) => {
                        const isToday = isSameDay(day, new Date())
                        return (
                            <div key={i} className={`py-3 text-center ${isToday ? 'bg-[#facb01]/10' : ''}`}>
                                <div className={`text-xs uppercase font-medium ${isToday ? 'text-[#271756]' : 'text-gray-500'}`}>
                                    {format(day, 'EEE')}
                                </div>
                                <div className={`text-xl font-bold ${isToday ? 'text-[#271756]' : 'text-gray-800'}`}>
                                    {format(day, 'd')}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto relative custom-scrollbar">
                <div className="flex min-h-max relative">
                    {/* Time Column */}
                    <div className="w-16 flex-shrink-0 border-r border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium z-20 bg-white sticky left-0">
                        {TIME_SLOTS.map(hour => (
                            <div key={hour} className="h-20 border-b border-gray-200 flex items-start justify-center pt-2 relative">
                                {hour}:00
                            </div>
                        ))}
                    </div>

                    {/* Clickable Grid Layer (Background) */}
                    <div className="absolute inset-0 pl-16 flex z-0">
                        {days.map((day, dIdx) => (
                            <div key={dIdx} className="flex-1 flex flex-col border-r border-gray-100 last:border-r-0">
                                {TIME_SLOTS.map(hour => {
                                    const bookings = getBookingsForDate(day)
                                    const isBooked = bookings.some(b => hour >= b.startTime && hour < b.endTime)

                                    return (
                                        <div
                                            key={hour}
                                            onClick={() => !isBooked && onSlotClick(day, hour)}
                                            className={`h-20 border-b border-gray-100 transition-colors ${isBooked
                                                    ? 'bg-gray-50/50 cursor-not-allowed'
                                                    : 'cursor-pointer hover:bg-[#facb01]/10 group'
                                                }`}
                                        >
                                            {!isBooked && (
                                                <div className="hidden group-hover:flex items-center justify-center h-full text-[#271756]/30">
                                                    <MousePointerClick size={16} />
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Events Layer (Foreground) */}
                    <div className="absolute inset-0 pl-16 flex z-10 pointer-events-none">
                        {days.map((day, dayIndex) => {
                            const dayBookings = getBookingsForDate(day)
                            return (
                                <div key={dayIndex} className="flex-1 relative h-full border-r border-transparent">
                                    {dayBookings.map(b => {
                                        const startHourIndex = TIME_SLOTS.indexOf(b.startTime)
                                        if (startHourIndex === -1) return null

                                        const duration = b.endTime - b.startTime
                                        const top = startHourIndex * 80
                                        const height = duration * 80

                                        return (
                                            <div
                                                key={b.id}
                                                className="absolute left-1 right-1 rounded-md p-2 bg-[#271756] text-white border-l-4 border-[#facb01] shadow-md overflow-hidden pointer-events-auto hover:z-20 hover:scale-[1.02] transition-all"
                                                style={{ top: `${top}px`, height: `${height - 2}px` }}
                                                title={`${b.startTime}:00 - ${b.endTime}:00 | ${b.userName}`}
                                            >
                                                <div className="text-xs font-bold truncate">{b.startTime}:00 - {b.endTime}:00</div>
                                                <div className="text-xs truncate font-medium text-[#facb01]">{rooms.find(r => r.id === b.roomId)?.name}</div>
                                                {type === 'day' && (
                                                    <div className="text-xs mt-1 opacity-80">{b.purpose} - {b.userName}</div>
                                                )}
                                            </div>
                                        )
                                    })}

                                    {/* Current Time Line */}
                                    {isSameDay(day, new Date()) && (() => {
                                        const now = new Date()
                                        const currentHour = now.getHours()
                                        const currentMin = now.getMinutes()
                                        if (currentHour >= 7 && currentHour <= 20) {
                                            const hourIdx = TIME_SLOTS.indexOf(currentHour)
                                            if (hourIdx !== -1) {
                                                const top = (hourIdx * 80) + ((currentMin / 60) * 80)
                                                return (
                                                    <div
                                                        className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none"
                                                        style={{ top: `${top}px` }}
                                                    >
                                                        <div className="w-2 h-2 bg-red-500 rounded-full absolute -left-1 -top-1"></div>
                                                    </div>
                                                )
                                            }
                                        }
                                        return null
                                    })()}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
