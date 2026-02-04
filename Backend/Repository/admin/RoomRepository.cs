using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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
        Task<RoomDetailDto2> GetRoomDetailAsync(int roomId);
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
        // HELPER METHOD - Parse Computer Specifications
        // ============================================
        private ComputerDto2 MapComputerToDto(Computer computer, string roomCode, string roomName)
        {
            var dto = new ComputerDto2
            {
                ComputerID = computer.ComputerId,
                RoomID = computer.RoomId,
                ComputerCode = $"{roomCode}-{computer.ComputerNumber:D2}",
                ComputerNumber = computer.ComputerNumber,
                ComputerName = computer.ComputerName,
                Specifications = computer.Specifications,
                Status = computer.Status?.ToLower() ?? "active",
                RoomCode = roomCode,
                RoomName = roomName
            };

            // Parse Specifications JSON nếu có
            if (!string.IsNullOrWhiteSpace(computer.Specifications))
            {
                try
                {
                    var specs = JsonSerializer.Deserialize<Dictionary<string, string>>(computer.Specifications);
                    if (specs != null)
                    {
                        dto.Brand = specs.ContainsKey("Brand") ? specs["Brand"] : "N/A";
                        dto.CPU = specs.ContainsKey("CPU") ? specs["CPU"] : "N/A";
                        dto.RAM = specs.ContainsKey("RAM") ? specs["RAM"] : "N/A";
                        dto.Storage = specs.ContainsKey("Storage") ? specs["Storage"] : "N/A";
                        dto.GPU = specs.ContainsKey("GPU") ? specs["GPU"] : "N/A";
                        dto.OS = specs.ContainsKey("OS") ? specs["OS"] : "N/A";
                    }
                }
                catch
                {
                    // Nếu không parse được JSON, set giá trị mặc định
                    dto.Brand = "N/A";
                    dto.CPU = "N/A";
                    dto.RAM = "N/A";
                    dto.Storage = "N/A";
                    dto.GPU = "N/A";
                    dto.OS = "N/A";
                }
            }
            else
            {
                // Không có specifications
                dto.Brand = "N/A";
                dto.CPU = "N/A";
                dto.RAM = "N/A";
                dto.Storage = "N/A";
                dto.GPU = "N/A";
                dto.OS = "N/A";
            }

            return dto;
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

        public async Task<RoomDetailDto2> GetRoomDetailAsync(int roomId)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)
                .Include(r => r.Computers)
                .FirstOrDefaultAsync(r => r.RoomId == roomId);

            if (room == null)
                return null;

            // Map computers sau khi đã load từ database
            var computersDto = new List<ComputerDto2>();
            foreach (var computer in room.Computers.OrderBy(c => c.ComputerNumber))
            {
                computersDto.Add(MapComputerToDto(computer, room.RoomCode, room.RoomName));
            }

            var roomDetail = new RoomDetailDto2
            {
                RoomID = room.RoomId,
                RoomTypeID = room.RoomTypeId,
                RoomCode = room.RoomCode,
                RoomName = room.RoomName,
                Capacity = room.Capacity,
                Floor = room.Floor,
                Description = room.Description,
                Status = room.Status,
                TypeName = room.RoomType.TypeName,
                BasePrice = (decimal)room.RoomType.BasePrice,
                TotalComputers = room.Computers.Count,
                ActiveComputers = room.Computers.Count(c => c.Status == "Active"),
                BrokenComputers = room.Computers.Count(c => c.Status == "Broken"),
                MaintenanceComputers = room.Computers.Count(c => c.Status == "Maintenance"),
                Computers = computersDto
            };

            return roomDetail;
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