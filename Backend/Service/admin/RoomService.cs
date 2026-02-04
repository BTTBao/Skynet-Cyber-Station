using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;

namespace Backend.Service
{
    public interface IRoomService
    {
        Task<IEnumerable<RoomDto>> GetAllRoomsAsync();
        Task<RoomDetailDto2> GetRoomByIdAsync(int roomId);
        Task<IEnumerable<RoomDto>> GetRoomsByFloorAsync(int floor);
        Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId);
        Task<IEnumerable<RoomDto>> SearchRoomsAsync(string searchTerm);
        Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime);
        Task<RoomDetailDto2> CreateRoomAsync(CreateRoomDto dto);
        Task<RoomDetailDto2> UpdateRoomAsync(int roomId, UpdateRoomDto dto);
        Task<bool> DeleteRoomAsync(int roomId);
    }

    public class RoomService : IRoomService
    {
        private readonly IRoomRepository _roomRepository;

        public RoomService(IRoomRepository roomRepository)
        {
            _roomRepository = roomRepository;
        }

        public async Task<IEnumerable<RoomDto>> GetAllRoomsAsync()
        {
            return await _roomRepository.GetAllRoomsWithDetailsAsync();
        }

        public async Task<RoomDetailDto2> GetRoomByIdAsync(int roomId)
        {
            var room = await _roomRepository.GetRoomDetailAsync(roomId);
            if (room == null)
                throw new KeyNotFoundException($"Phòng với ID {roomId} không tồn tại");

            return room;
        }

        public async Task<IEnumerable<RoomDto>> GetRoomsByFloorAsync(int floor)
        {
            if (floor < 1 || floor > 10)
                throw new ArgumentException("Số tầng phải từ 1 đến 10");

            return await _roomRepository.GetRoomsByFloorAsync(floor);
        }

        public async Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId)
        {
            return await _roomRepository.GetRoomsByTypeAsync(roomTypeId);
        }

        public async Task<IEnumerable<RoomDto>> SearchRoomsAsync(string searchTerm)
        {
            return await _roomRepository.SearchRoomsAsync(searchTerm);
        }

        public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime)
        {
            if (startTime >= endTime)
                throw new ArgumentException("Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc");

            if (startTime < DateTime.Now)
                throw new ArgumentException("Không thể tìm phòng trống trong quá khứ");

            return await _roomRepository.GetAvailableRoomsAsync(startTime, endTime);
        }

        public async Task<RoomDetailDto2> CreateRoomAsync(CreateRoomDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.RoomCode))
                throw new ArgumentException("Mã phòng không được để trống");

            if (string.IsNullOrWhiteSpace(dto.RoomName))
                throw new ArgumentException("Tên phòng không được để trống");

            if (dto.Capacity <= 0)
                throw new ArgumentException("Sức chứa phải lớn hơn 0");

            if (dto.Floor.HasValue && (dto.Floor < 1 || dto.Floor > 10))
                throw new ArgumentException("Số tầng phải từ 1 đến 10");

            if (await _roomRepository.IsRoomCodeExistsAsync(dto.RoomCode))
                throw new ArgumentException($"Mã phòng '{dto.RoomCode}' đã tồn tại");

            var room = new Room
            {
                RoomTypeId = dto.RoomTypeID,
                RoomCode = dto.RoomCode,
                RoomName = dto.RoomName,
                Capacity = dto.Capacity,
                Floor = dto.Floor,
                Description = dto.Description,
                Status = "Active"
            };

            var createdRoom = await _roomRepository.AddAsync(room);

            return await _roomRepository.GetRoomDetailAsync(createdRoom.RoomId);
        }

        public async Task<RoomDetailDto2> UpdateRoomAsync(int roomId, UpdateRoomDto dto)
        {
            var room = await _roomRepository.GetByIdAsync(roomId);
            if (room == null)
                throw new KeyNotFoundException($"Phòng với ID {roomId} không tồn tại");

            if (string.IsNullOrWhiteSpace(dto.RoomName))
                throw new ArgumentException("Tên phòng không được để trống");

            if (dto.Capacity <= 0)
                throw new ArgumentException("Sức chứa phải lớn hơn 0");

            if (dto.Floor.HasValue && (dto.Floor < 1 || dto.Floor > 10))
                throw new ArgumentException("Số tầng phải từ 1 đến 10");

            if (!string.IsNullOrEmpty(dto.Status) &&
                dto.Status != "Active" && dto.Status != "Inactive")
                throw new ArgumentException("Trạng thái chỉ có thể là 'Active' hoặc 'Inactive'");

            room.RoomTypeId = dto.RoomTypeID;
            room.RoomName = dto.RoomName;
            room.Capacity = dto.Capacity;
            room.Floor = dto.Floor;
            room.Description = dto.Description;

            if (!string.IsNullOrEmpty(dto.Status))
                room.Status = dto.Status;

            await _roomRepository.UpdateAsync(room);

            return await _roomRepository.GetRoomDetailAsync(roomId);
        }

        public async Task<bool> DeleteRoomAsync(int roomId)
        {
            if (!await _roomRepository.ExistsAsync(roomId))
                throw new KeyNotFoundException($"Phòng với ID {roomId} không tồn tại");

            var computerCount = await _roomRepository.GetTotalComputersInRoomAsync(roomId);
            if (computerCount > 0)
                throw new InvalidOperationException(
                    $"Phòng còn {computerCount} máy tính. Vui lòng xóa máy trước."
                );

            return await _roomRepository.DeleteAsync(roomId);
        }
    }
}