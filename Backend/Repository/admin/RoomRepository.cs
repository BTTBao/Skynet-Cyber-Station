using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;
using Microsoft.EntityFrameworkCore;


namespace Backend.Repository.admin
{
    public interface IRoomRepository
    {

        Task<IEnumerable<Room>> GetAllAsync();

        Task<Room> GetByIdAsync(int roomId);

        Task<Room> AddAsync(Room room);

        Task<Room> UpdateAsync(Room room);

        Task<bool> DeleteAsync(int roomId);
        Task<bool> ExistsAsync(int roomId);

        Task<IEnumerable<RoomDto>> GetAllRoomsWithDetailsAsync();

        Task<RoomDetailDto> GetRoomDetailAsync(int roomId);

        Task<IEnumerable<RoomDto>> GetRoomsByFloorAsync(int floor);

        Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId);


        Task<IEnumerable<RoomDto>> SearchRoomsAsync(string searchTerm);


        Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime);
        Task<bool> IsRoomCodeExistsAsync(string roomCode, int? excludeRoomId = null);

        Task<int> GetTotalComputersInRoomAsync(int roomId);
    }
    public class RoomRepository : IRoomRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public RoomRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // ============================================
        // BASIC CRUD
        // ============================================

        public async Task<IEnumerable<Room>> GetAllAsync()
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .ToListAsync();
        }

        public async Task<Room> GetByIdAsync(int roomId)
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .FirstOrDefaultAsync(r => r.RoomId == roomId);
        }

        public async Task<Room> AddAsync(Room room)
        {
            _context.Rooms.Add(room);
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<Room> UpdateAsync(Room room)
        {
            _context.Entry(room).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return room;
        }

        public async Task<bool> DeleteAsync(int roomId)
        {
            var room = await _context.Rooms.FindAsync(roomId);
            if (room == null) return false;

            _context.Rooms.Remove(room);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int roomId)
        {
            return await _context.Rooms.AnyAsync(r => r.RoomId == roomId);
        }

        // ============================================
        // QUERIES WITH DTOs
        // ============================================

        public async Task<IEnumerable<RoomDto>> GetAllRoomsWithDetailsAsync()
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .Select(r => new RoomDto
                {
                    RoomID = r.RoomId,
                    RoomTypeID = r.RoomTypeId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,
                    TypeName = r.RoomType.TypeName,
                    BasePrice = (decimal)r.RoomType.BasePrice,
                    TotalComputers = r.Computers.Count,
                    ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                    BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                    MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance")
                })
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.RoomCode)
                .ToListAsync();
        }

        public async Task<RoomDetailDto> GetRoomDetailAsync(int roomId)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .Where(r => r.RoomId == roomId)
                .Select(r => new RoomDetailDto
                {
                    RoomID = r.RoomId,
                    RoomTypeID = r.RoomTypeId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,
                    TypeName = r.RoomType.TypeName,
                    BasePrice = (decimal)r.RoomType.BasePrice,
                    TotalComputers = r.Computers.Count,
                    ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                    BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                    MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance"),
                    Computers = r.Computers.Select(c => new ComputerDto
                    {
                        ComputerID = c.ComputerId,
                        RoomID = c.RoomId,
                        ComputerNumber = c.ComputerNumber,
                        ComputerName = c.ComputerName,
                        Specifications = c.Specifications,
                        Status = c.Status,
                        RoomCode = r.RoomCode,
                        RoomName = r.RoomName
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            return room;
        }

        public async Task<IEnumerable<RoomDto>> GetRoomsByFloorAsync(int floor)
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .Where(r => r.Floor == floor)
                .Select(r => new RoomDto
                {
                    RoomID = r.RoomId,
                    RoomTypeID = r.RoomTypeId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,
                    TypeName = r.RoomType.TypeName,
                    BasePrice = (decimal)r.RoomType.BasePrice,
                    TotalComputers = r.Computers.Count,
                    ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                    BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                    MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance")
                })
                .OrderBy(r => r.RoomCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<RoomDto>> GetRoomsByTypeAsync(int roomTypeId)
        {
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .Where(r => r.RoomTypeId == roomTypeId)
                .Select(r => new RoomDto
                {
                    RoomID = r.RoomId,
                    RoomTypeID = r.RoomTypeId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,
                    TypeName = r.RoomType.TypeName,
                    BasePrice = (decimal)r.RoomType.BasePrice,
                    TotalComputers = r.Computers.Count,
                    ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                    BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                    MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance")
                })
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.RoomCode)
                .ToListAsync();
        }

        public async Task<IEnumerable<RoomDto>> SearchRoomsAsync(string searchTerm)
        {
            var query = _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                query = query.Where(r =>
                    r.RoomCode.ToLower().Contains(searchTerm) ||
                    r.RoomName.ToLower().Contains(searchTerm) ||
                    r.RoomType.TypeName.ToLower().Contains(searchTerm) ||
                    (r.Description != null && r.Description.ToLower().Contains(searchTerm))
                );
            }

            return await query.Select(r => new RoomDto
            {
                RoomID = r.RoomId,
                RoomTypeID = r.RoomTypeId,
                RoomCode = r.RoomCode,
                RoomName = r.RoomName,
                Capacity = r.Capacity,
                Floor = r.Floor,
                Description = r.Description,
                Status = r.Status,
                TypeName = r.RoomType.TypeName,
                BasePrice = (decimal)r.RoomType.BasePrice,
                TotalComputers = r.Computers.Count,
                ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance")
            })
            .OrderBy(r => r.Floor)
            .ThenBy(r => r.RoomCode)
            .ToListAsync();
        }

        public async Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime)
        {
            // Lấy danh sách RoomID đã được đặt trong khoảng thời gian
            var bookedRoomIds = await _context.RoomBookings
                .Where(b => b.Status == "Approved" &&
                           ((b.StartTime >= startTime && b.StartTime < endTime) ||
                            (b.EndTime > startTime && b.EndTime <= endTime) ||
                            (b.StartTime <= startTime && b.EndTime >= endTime)))
                .Select(b => b.RoomId)
                .Distinct()
                .ToListAsync();

            // Lấy các phòng chưa được đặt và đang active
            return await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .Where(r => r.Status == "Active" && !bookedRoomIds.Contains(r.RoomId))
                .Select(r => new RoomDto
                {
                    RoomID = r.RoomId,
                    RoomTypeID = r.RoomTypeId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,
                    TypeName = r.RoomType.TypeName,
                    BasePrice = (decimal)r.RoomType.BasePrice,
                    TotalComputers = r.Computers.Count,
                    ActiveComputers = r.Computers.Count(c => c.Status == "Active"),
                    BrokenComputers = r.Computers.Count(c => c.Status == "Broken"),
                    MaintenanceComputers = r.Computers.Count(c => c.Status == "Maintenance")
                })
                .OrderBy(r => r.Floor)
                .ThenBy(r => r.RoomCode)
                .ToListAsync();
        }

        // ============================================
        // VALIDATION
        // ============================================

        public async Task<bool> IsRoomCodeExistsAsync(string roomCode, int? excludeRoomId = null)
        {
            var query = _context.Rooms.Where(r => r.RoomCode == roomCode);

            if (excludeRoomId.HasValue)
            {
                query = query.Where(r => r.RoomId != excludeRoomId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<int> GetTotalComputersInRoomAsync(int roomId)
        {
            return await _context.Computers
                .Where(c => c.RoomId == roomId)
                .CountAsync();
        }
    }
}