
import { BookingConfig, BookingHelpers } from '../data/bookingConfig';

const API_URL = 'https://localhost:7140/api/client';

export const BookingService = {
    // Lấy danh sách booking để hiển thị lên lịch
    getAllBookings: async () => {
        try {
            const response = await fetch(`${API_URL}/Booking`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy danh sách đặt phòng:', error);
            throw error;
        }
    },

    // Lấy lịch sử theo User ID
    getBookingHistory: async (userId) => {
        try {
            const response = await fetch(`${API_URL}/Booking/user/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử đặt phòng:', error);
            throw error;
        }
    },

    /**
     * VALIDATION FUNCTIONS
     */

    /**
     * Kiểm tra user đã đặt bao nhiêu lịch trong ngày
     */
    checkDailyBookingLimit: (userBookings, targetDate) => {
        const bookingsOnDate = userBookings.filter(b => {
            const bookingDate = b.date || b.bookingDate;
            return bookingDate === targetDate &&
                (b.status === BookingConfig.STATUS.PENDING ||
                    b.status === BookingConfig.STATUS.APPROVED);
        });

        return {
            count: bookingsOnDate.length,
            exceeded: bookingsOnDate.length >= BookingConfig.MAX_BOOKINGS_PER_DAY,
            message: bookingsOnDate.length >= BookingConfig.MAX_BOOKINGS_PER_DAY
                ? BookingConfig.MESSAGES.MAX_BOOKINGS_EXCEEDED
                : null
        };
    },

    /**
     * Kiểm tra conflict với lịch của user
     */
    checkUserTimeConflict: (userBookings, targetDate, startHour, endHour) => {
        const conflictBookings = userBookings.filter(b => {
            const bookingDate = b.date || b.bookingDate;
            if (bookingDate !== targetDate) return false;

            // Chỉ check với booking đang active (Pending, Approved, hoặc đang sử dụng)
            const isActive = b.status === BookingConfig.STATUS.PENDING ||
                b.status === BookingConfig.STATUS.APPROVED ||
                b.isUsed === true;

            if (!isActive) return false;

            const bookingStart = b.startHour || b.startTime;
            const bookingEnd = b.endHour || b.endTime;

            return BookingHelpers.hasTimeConflict(startHour, endHour, bookingStart, bookingEnd);
        });

        return {
            hasConflict: conflictBookings.length > 0,
            conflictBookings: conflictBookings,
            message: conflictBookings.length > 0
                ? BookingConfig.MESSAGES.TIME_CONFLICT
                : null
        };
    },

    /**
     * Kiểm tra slot có bị chiếm dụng không (bởi user khác hoặc đang giữ chỗ)
     */
    checkSlotAvailability: (allBookings, roomId, targetDate, startHour, endHour) => {
        const occupiedSlots = allBookings.filter(b => {
            if (b.roomId !== roomId) return false;

            const bookingDate = b.date || b.bookingDate;
            if (bookingDate !== targetDate) return false;

            // Slot bị chiếm nếu: Pending, Approved, hoặc đang sử dụng
            const isOccupied = b.status === BookingConfig.STATUS.PENDING ||
                b.status === BookingConfig.STATUS.APPROVED ||
                b.isUsed === true;

            if (!isOccupied) return false;

            const bookingStart = b.startTime || b.startHour;
            const bookingEnd = b.endTime || b.endHour;

            return BookingHelpers.hasTimeConflict(startHour, endHour, bookingStart, bookingEnd);
        });

        return {
            isAvailable: occupiedSlots.length === 0,
            occupiedBy: occupiedSlots,
            message: occupiedSlots.length > 0
                ? BookingConfig.MESSAGES.SLOT_OCCUPIED
                : null
        };
    },

    /**
     * Validate toàn bộ booking request
     */
    validateBookingRequest: async (userId, roomId, date, startHour, endHour, duration) => {
        const errors = [];

        // 1. Kiểm tra ngày nghỉ
        if (BookingHelpers.isClosedDate(date)) {
            errors.push(BookingConfig.MESSAGES.CLOSED_DATE);
        }

        // 2. Kiểm tra thời gian đã qua
        if (BookingHelpers.isPastTime(date, startHour)) {
            errors.push(BookingConfig.MESSAGES.PAST_TIME);
        }

        // 3. Kiểm tra giờ mở cửa
        if (!BookingHelpers.isWithinOperatingHours(startHour, endHour)) {
            errors.push(BookingConfig.MESSAGES.OUTSIDE_HOURS);
        }

        // 4. Kiểm tra slot hợp lệ
        if (!BookingHelpers.isValidSlotStart(startHour, 0)) {
            errors.push(BookingConfig.MESSAGES.INVALID_SLOT);
        }

        // 5. Kiểm tra duration hợp lệ
        const durationMinutes = Math.round((endHour - startHour) * 60);

        if (!BookingConfig.ALLOWED_SLOT_DURATIONS.includes(durationMinutes)) {
            errors.push(BookingConfig.MESSAGES.INVALID_DURATION);
        }

        // 6. Lấy lịch của user để check limit và conflict
        try {
            const userBookings = await BookingService.getBookingHistory(userId);

            // 6a. Check giới hạn số lịch/ngày
            const limitCheck = BookingService.checkDailyBookingLimit(userBookings, date);
            if (limitCheck.exceeded) {
                errors.push(limitCheck.message);
            }

            // 6b. Check conflict với lịch user
            const conflictCheck = BookingService.checkUserTimeConflict(userBookings, date, startHour, endHour);
            if (conflictCheck.hasConflict) {
                errors.push(conflictCheck.message);
            }
        } catch (error) {
            console.error('Lỗi khi check user bookings:', error);
            errors.push('Không thể kiểm tra lịch của bạn. Vui lòng thử lại.');
        }

        // 7. Lấy tất cả booking để check slot availability
        try {
            const allBookings = await BookingService.getAllBookings();
            const slotCheck = BookingService.checkSlotAvailability(allBookings, roomId, date, startHour, endHour);
            if (!slotCheck.isAvailable) {
                errors.push(slotCheck.message);
            }
        } catch (error) {
            console.error('Lỗi khi check slot availability:', error);
            errors.push('Không thể kiểm tra tình trạng phòng. Vui lòng thử lại.');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
};
