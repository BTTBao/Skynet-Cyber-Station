const API_BASE_URL = 'https://localhost:7140/api';

/**
 * Service để gọi API liên quan đến Room
 */
export const RoomService = {
    /**
     * Lấy danh sách tất cả các phòng
     * @returns {Promise<Array>} Danh sách phòng
     */
    async getAllRooms() {
        try {
            const response = await fetch(`${API_BASE_URL}/Room`);
            if (!response.ok) {
                throw new Error('Không thể lấy danh sách phòng');
            }
            const data = await response.json();

            // Transform data từ backend sang format frontend đang dùng
            return data.map(room => {
                // tách chuỗi Specifications từ thành mảng

                const parts = room.representativeComputerSpecs?.split(',').map(p => p.trim()) || [];

                return {
                    id: room.roomId,
                    name: room.roomName,
                    capacity: room.capacity,
                    machineCount: room.capacity,
                    // 2. Gán các phần tử đã tách vào đúng vị trí trong object specs
                    specs: {
                        cpu: parts[0] || "Đang cập nhật",
                        ram: parts[1] || "Đang cập nhật",
                        storage: parts[2] || "Đang cập nhật",
                        gpu: parts[3] || "Đang cập nhật"
                    },
                    pricePerHour: room.pricePerHour || 0,
                    image: "https://picsum.photos/id/4/800/600",
                    features: ["Máy chiếu", "Bảng trắng"],
                    software: ["Đang cập nhật"],
                    floor: room.floor,
                    status: room.status,
                    roomCode: room.roomCode
                };
            });
        } catch (error) {
            console.error('Error fetching rooms:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin chi tiết của một phòng
     * @param {number} roomId - ID của phòng
     * @returns {Promise<Object>} Thông tin chi tiết phòng
     */
    async getRoomDetail(roomId) {
        try {
            const response = await fetch(`${API_BASE_URL}/Room/${roomId}`);
            if (!response.ok) {
                throw new Error('Không thể lấy thông tin phòng');
            }
            const data = await response.json();
            // Transform data từ backend sang format frontend
            return {
                id: data.roomId,
                name: data.roomName,
                capacity: data.capacity,
                machineCount: data.computers?.length || 0,
                specs: data.computers?.[0] ? {
                    cpu: data.computers[0].specifications || "Đang cập nhật",
                    ram: "Đang cập nhật",
                    gpu: "Đang cập nhật",
                    storage: "Đang cập nhật"
                } : {
                    cpu: "Đang cập nhật",
                    ram: "Đang cập nhật",
                    gpu: "Đang cập nhật",
                    storage: "Đang cập nhật"
                },
                pricePerHour: data.pricePerHour || 0,
                image: "https://picsum.photos/id/4/800/600",
                features: ["Máy chiếu", "Bảng trắng"],
                software: ["Đang cập nhật"],
                floor: data.floor,
                status: data.status,
                roomCode: data.roomCode,
                description: data.description,
                roomTypeName: data.roomTypeName,
                computers: data.computers || [],
                activeIncidentReports: data.activeIncidentReports || data.ActiveIncidentReports || []
            };
        } catch (error) {
            console.error('Error fetching room detail:', error);
            throw error;
        }
    }
};
