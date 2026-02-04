
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

    // --- MỚI: Lấy lịch sử theo User ID ---
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
    }
};
