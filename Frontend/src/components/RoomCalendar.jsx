import React, { useState, useEffect } from 'react'
import { addMonths, subMonths, addWeeks, subWeeks, addDays, parseISO, isSameDay } from 'date-fns'
import { MousePointerClick } from 'lucide-react'
import { CalendarHeader } from './calendar/CalendarHeader'
import { MonthView } from './calendar/MonthView'
import { TimeGrid } from './calendar/TimeGrid'

// Component
export const RoomCalendar = ({
    bookings,
    rooms,
    preSelectedRoomId,
    onSelectSlot
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'month' | 'week' | 'day'
    const [selectedRoomId, setSelectedRoomId] = useState(preSelectedRoomId || 'all');

    // Cập nhật khi props thay đổi
    useEffect(() => {
        if (preSelectedRoomId) setSelectedRoomId(preSelectedRoomId);
    }, [preSelectedRoomId]);

    // Xử lý điều hướng
    const next = () => {
        if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, 1));
    };

    const prev = () => {
        if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
        else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
        else setCurrentDate(addDays(currentDate, -1));
    };

    const today = () => setCurrentDate(new Date());

    // Lọc danh sách đặt phòng
    const getBookingsForDate = (date) => {
        const result = bookings.filter(b => {
            const bookingDate = parseISO(b.date);
            const isSameDate = isSameDay(bookingDate, date);

            // Fix: So sánh lỏng (==) để handle string vs number
            // selectedRoomId từ dropdown là string, b.roomId từ backend là number
            const isRoomMatch = selectedRoomId === 'all' || b.roomId == selectedRoomId;

            return isSameDate && isRoomMatch && b.status !== 'REJECTED';
        });

        return result;
    };

    const handleSlotClick = (day, hour) => {
        if (onSelectSlot) {
            onSelectSlot(day, hour)
        }
    }

    const handleDayClick = (day) => {
        setCurrentDate(day)
        setViewMode('day')
    }

    return (
        <div className="max-w-7xl mx-auto h-full flex flex-col">
            <CalendarHeader
                currentDate={currentDate}
                viewMode={viewMode}
                setViewMode={setViewMode}
                selectedRoomId={selectedRoomId}
                setSelectedRoomId={setSelectedRoomId}
                rooms={rooms}
                onPrev={prev}
                onNext={next}
                onToday={today}
            />
            <div className="flex-1 min-h-0">
                {viewMode === 'month' ? (
                    <MonthView
                        currentDate={currentDate}
                        getBookingsForDate={getBookingsForDate}
                        rooms={rooms}
                        onDayClick={handleDayClick}
                    />
                ) : (
                    <TimeGrid
                        type={viewMode}
                        currentDate={currentDate}
                        getBookingsForDate={getBookingsForDate}
                        rooms={rooms}
                        onSlotClick={handleSlotClick}
                        selectedRoomId={selectedRoomId}
                    />
                )}
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-end">
                <MousePointerClick size={14} className="mr-1" /> Nhấn vào khung giờ trống để đặt phòng
            </div>
        </div>
    )
}