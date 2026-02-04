import React from 'react'
import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { MousePointerClick } from 'lucide-react'
import { TIME_SLOTS } from '../../data/constants'

export const TimeGrid = ({ type, currentDate, getBookingsForDate, rooms, onSlotClick, selectedRoomId }) => {
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
                                    // Chỉ block slot nếu:
                                    // 1. Đã chọn phòng cụ thể (không phải 'all')
                                    // 2. Và phòng đó đã có booking trong khung giờ này
                                    const isBooked = selectedRoomId !== 'all' && bookings.some(b => hour >= b.startTime && hour < b.endTime)

                                    // Không cho click nếu chưa chọn phòng cụ thể
                                    const canClick = selectedRoomId !== 'all'

                                    return (
                                        <div
                                            key={hour}
                                            onClick={() => canClick && !isBooked && onSlotClick(day, hour)}
                                            className={`h-20 border-b border-gray-100 transition-colors ${isBooked
                                                ? 'bg-gray-50/50 cursor-not-allowed'
                                                : canClick
                                                    ? 'cursor-pointer hover:bg-[#facb01]/10 group'
                                                    : 'cursor-default bg-gray-50/30'
                                                }`}
                                        >
                                            {canClick && !isBooked && (
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

                            // Nhóm bookings theo khung giờ để xếp cột khi có nhiều phòng cùng giờ
                            const groupedByTime = {}
                            dayBookings.forEach(b => {
                                let startHourRaw = b.startTime;
                                if (typeof startHourRaw === 'string' && startHourRaw.includes('T')) {
                                    startHourRaw = new Date(startHourRaw).getHours();
                                }
                                const key = startHourRaw
                                if (!groupedByTime[key]) groupedByTime[key] = []
                                groupedByTime[key].push(b)
                            })

                            return (
                                <div key={dayIndex} className="flex-1 relative h-full border-r border-transparent">
                                    {dayBookings.map((b, bIndex) => {
                                        let startHourRaw = b.startTime;
                                        let endHourRaw = b.endTime;
                                        // Kiểm tra nếu nó là chuỗi ISO (VD: "2025-02-09T08:00:00") thì parse ra giờ
                                        if (typeof startHourRaw === 'string' && startHourRaw.includes('T')) {
                                            startHourRaw = new Date(startHourRaw).getHours();
                                        }
                                        if (typeof endHourRaw === 'string' && endHourRaw.includes('T')) {
                                            endHourRaw = new Date(endHourRaw).getHours();
                                        }

                                        // 2. Tìm index dựa trên số giờ đã parse
                                        const startHourIndex = TIME_SLOTS.indexOf(Number(startHourRaw))
                                        if (startHourIndex === -1) return null

                                        const duration = Number(endHourRaw) - Number(startHourRaw)

                                        const top = startHourIndex * 80
                                        const height = duration * 80

                                        // Xác định màu sắc dựa trên status
                                        const isPending = b.status?.toUpperCase() === 'PENDING'
                                        const bgColor = isPending ? 'bg-orange-400' : 'bg-[#271756]'
                                        const borderColor = isPending ? 'border-orange-600' : 'border-[#facb01]'
                                        const textAccentColor = isPending ? 'text-orange-100' : 'text-[#facb01]'

                                        // Tính toán vị trí cột khi có nhiều booking cùng giờ
                                        const overlappingBookings = groupedByTime[startHourRaw] || []
                                        const columnIndex = overlappingBookings.findIndex(ob => ob.id === b.id)
                                        const totalColumns = overlappingBookings.length

                                        // Nếu có nhiều booking cùng giờ, chia đều không gian
                                        const columnWidth = totalColumns > 1 ? `${100 / totalColumns}%` : 'calc(100% - 8px)'
                                        const leftOffset = totalColumns > 1 ? `${(columnIndex * 100) / totalColumns}%` : '4px'

                                        return (
                                            <div
                                                key={b.id}
                                                className={`absolute rounded-md p-2 ${bgColor} text-white border-l-4 ${borderColor} shadow-md overflow-hidden pointer-events-auto hover:z-20 hover:scale-[1.02] transition-all`}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height - 2}px`,
                                                    left: leftOffset,
                                                    width: columnWidth,
                                                    paddingLeft: totalColumns > 1 ? '4px' : undefined,
                                                    paddingRight: totalColumns > 1 ? '4px' : undefined
                                                }}
                                                title={`${startHourRaw}:00 - ${endHourRaw}:00 | ${b.userName} | ${isPending ? 'Chờ duyệt' : 'Đã xác nhận'}`}
                                            >
                                                <div className="text-xs font-bold truncate flex items-center justify-between">
                                                    <span>{startHourRaw}:00 - {endHourRaw}:00</span>
                                                    {isPending && totalColumns === 1 && <span className="text-[10px] bg-white/20 px-1 py-0.5 rounded">Chờ duyệt</span>}
                                                </div>
                                                <div className={`text-xs truncate font-medium ${textAccentColor}`}>{rooms.find(r => r.id === b.roomId)?.name}</div>
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
