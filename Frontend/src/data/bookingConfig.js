/**
 * Cấu hình hệ thống đặt phòng
 * Tất cả các quy tắc và giới hạn của hệ thống booking
 */

export const BookingConfig = {
    // Giới hạn số lượng booking
    MAX_BOOKINGS_PER_DAY: 3, // User chỉ được đặt tối đa N lịch trong 1 ngày

    // Thời gian giữ chỗ
    RESERVATION_HOLD_MINUTES: 10, // Giữ chỗ trong X phút khi user chọn slot

    // Thời gian xử lý booking
    PENDING_TIMEOUT_HOURS: 24, // Booking Pending phải được xử lý trong X giờ

    // Slot thời gian cho phép (phút)
    ALLOWED_SLOT_DURATIONS: [
        60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345, 360
    ], // 15p, 30p, 45p, 1h, 1.5h, 2h, ... 10h
    DEFAULT_SLOT_DURATION: 60, // Mặc định 1 giờ

    // Giờ làm việc của phòng máy
    OPENING_HOURS: {
        START: 7, // 07:00
        END: 21, // 22:00
    },

    // Slot intervals (mỗi bao nhiêu phút có 1 slot)
    SLOT_INTERVAL_MINUTES: 15, // Mốc thời gian: 7:00, 7:15, 7:30, 7:45, 8:00...

    // Ngày nghỉ trong tuần (0 = Chủ nhật, 6 = Thứ 7)
    CLOSED_WEEKDAYS: [0], // Nếu rỗng = mở cửa tất cả các ngày

    // Ngày nghỉ lễ (định dạng YYYY-MM-DD)
    HOLIDAYS: [
        '2026-01-01', // Tết Dương lịch
        '2026-04-30', // 30/4
        '2026-05-01', // 1/5
        '2026-09-02', // Quốc khánh
    ],

    // Ngày bảo trì (định dạng YYYY-MM-DD)
    MAINTENANCE_DATES: [
        // '2026-02-15', // Ví dụ
    ],

    // Số ngày tối đa được đặt trước
    MAX_ADVANCE_BOOKING_DAYS: 30,

    // Status mapping
    STATUS: {
        PENDING: 'Pending',
        APPROVED: 'Approved',
        REJECTED: 'Rejected',
    },

    // Messages
    MESSAGES: {
        MAX_BOOKINGS_EXCEEDED: `Bạn đã đạt giới hạn đặt phòng trong ngày (tối đa 3 lịch/ngày)`,
        TIME_CONFLICT: 'Bạn đã có lịch đặt trùng thời gian trong ngày này',
        SLOT_OCCUPIED: 'Khung giờ này đã có người đặt hoặc đang được giữ chỗ',
        PAST_TIME: 'Không thể đặt lịch ở thời điểm đã qua',
        OUTSIDE_HOURS: 'Chỉ được đặt trong giờ mở cửa (7:00 - 21:00)',
        CLOSED_DATE: 'Ngày này phòng máy không mở cửa (nghỉ lễ/bảo trì)',
        INVALID_SLOT: 'Thời gian bắt đầu không hợp lệ',
        INVALID_DURATION: 'Thời lượng không hợp lệ (chọn: 15p, 30p, 45p, 1h, 1.5h, 2h...)',
    }
}

/**
 * Helper functions cho booking validation
 */
export const BookingHelpers = {
    /**
     * Kiểm tra xem ngày có phải ngày nghỉ không
     */
    isClosedDate: (dateString) => {
        const date = new Date(dateString)
        const dayOfWeek = date.getDay()

        // Check weekday
        if (BookingConfig.CLOSED_WEEKDAYS.includes(dayOfWeek)) {
            return true
        }

        // Check holiday
        if (BookingConfig.HOLIDAYS.includes(dateString)) {
            return true
        }

        // Check maintenance
        if (BookingConfig.MAINTENANCE_DATES.includes(dateString)) {
            return true
        }

        return false
    },

    /**
     * Kiểm tra slot có hợp lệ không (trùng mốc)
     * @param {number} hour - Giờ (có thể là decimal: 7.25 = 7:15)
     * @param {number} minute - Phút (option, mặc định 0)
     */
    isValidSlotStart: (hour, minute = 0) => {
        // Nếu hour là decimal, chuyển thành giờ và phút
        let hours = hour;
        let minutes = minute;

        if (hour % 1 !== 0) {
            // hour là decimal (VD: 7.25)
            hours = Math.floor(hour);
            minutes = Math.round((hour - hours) * 60);
        }

        const totalMinutes = hours * 60 + minutes;
        return totalMinutes % BookingConfig.SLOT_INTERVAL_MINUTES === 0;
    },

    /**
     * Lấy danh sách slot hợp lệ trong ngày
     */
    getValidSlots: () => {
        const slots = []
        const { START, END } = BookingConfig.OPENING_HOURS
        const interval = BookingConfig.SLOT_INTERVAL_MINUTES

        for (let hour = START; hour < END; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
                const totalMinutes = hour * 60 + minute
                if (totalMinutes < END * 60) {
                    slots.push({
                        hour,
                        minute,
                        display: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                    })
                }
            }
        }

        return slots
    },

    /**
     * Kiểm tra thời gian có nằm trong giờ mở cửa không
     */
    isWithinOperatingHours: (startHour, endHour) => {
        const { START, END } = BookingConfig.OPENING_HOURS
        return startHour >= START && endHour <= END
    },

    /**
     * Kiểm tra xem thời gian có qua rồi không
     */
    isPastTime: (dateString, hour) => {
        const bookingTime = new Date(dateString)
        bookingTime.setHours(hour, 0, 0, 0)

        const now = new Date()
        return bookingTime < now
    },

    /**
     * Chuyển đổi duration (giờ) sang slot duration hợp lệ
     */
    getValidDuration: (durationHours) => {
        const durationMinutes = durationHours * 60
        if (BookingConfig.ALLOWED_SLOT_DURATIONS.includes(durationMinutes)) {
            return durationMinutes
        }
        return BookingConfig.DEFAULT_SLOT_DURATION
    },

    /**
     * Kiểm tra hai booking có conflict không
     */
    hasTimeConflict: (booking1Start, booking1End, booking2Start, booking2End) => {
        return (
            (booking1Start >= booking2Start && booking1Start < booking2End) ||
            (booking1End > booking2Start && booking1End <= booking2End) ||
            (booking1Start <= booking2Start && booking1End >= booking2End)
        )
    },

    /**
     * Format số giờ thành chuỗi HH:mm
     */
    formatHourToTime: (hour, minute = 0) => {
        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
}
