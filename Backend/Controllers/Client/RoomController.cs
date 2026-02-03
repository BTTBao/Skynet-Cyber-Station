using Backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Controllers.Client
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context; // Thay AppDbContext bằng tên Context của bạn

        public RoomController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // 1. API lấy danh sách phòng (Tên, sức chứa, cấu hình 1 máy)
        // GET: api/Room
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomListDto>>> GetRooms()
        {
            var rooms = await _context.Rooms
                .Where(r => r.Status == "Active")
                .Include(r => r.Computers) // Load dữ liệu bảng Computer
                .Include(r => r.RoomType)
                .Select(r => new RoomListDto
                {
                    RoomId = r.RoomId,
                    RoomName = r.RoomName,
                    RoomCode = r.RoomCode,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Status = r.Status,
                    // Lấy thông số kỹ thuật của máy tính đầu tiên tìm thấy trong phòng
                    RepresentativeComputerSpecs = r.Computers.Any()
                        ? r.Computers.FirstOrDefault().Specifications
                        : "Chưa có máy tính",

                    PricePerHour = r.RoomType.BasePrice
                })
                .ToListAsync();

            return Ok(rooms);
        }

        // 2. API lấy chi tiết 1 phòng
        // GET: api/Room/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDetailDto>> GetRoomDetail(int id)
        {
            var room = await _context.Rooms
                .Include(r => r.RoomType)  // Join bảng Loại phòng
                .Include(r => r.Computers) // Join bảng Máy tính
                .Where(r => r.RoomId == id)
                .Select(r => new RoomDetailDto
                {
                    RoomId = r.RoomId,
                    RoomCode = r.RoomCode,
                    RoomName = r.RoomName,
                    Capacity = r.Capacity,
                    Floor = r.Floor,
                    Description = r.Description,
                    Status = r.Status,

                    // Thông tin từ bảng RoomType
                    RoomTypeName = r.RoomType.TypeName,
                    PricePerHour = r.RoomType.BasePrice,

                    // Map danh sách máy tính sang DTO con
                    Computers = r.Computers.Select(c => new ComputerDto
                    {
                        ComputerId = c.ComputerId,
                        ComputerName = c.ComputerName,
                        Specifications = c.Specifications,
                        Status = c.Status
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (room == null)
            {
                return NotFound(new { message = "Không tìm thấy phòng này" });
            }

            return Ok(room);
        }
    }
    public class RoomListDto
    {
        public int RoomId { get; set; }
        public string RoomName { get; set; }
        public string RoomCode { get; set; }
        public int Capacity { get; set; }
        public int? Floor { get; set; }
        public string Status { get; set; }
        // Thông số kĩ thuật đại diện của 1 máy trong phòng
        public decimal? PricePerHour { get; set; }
        public string? RepresentativeComputerSpecs { get; set; }
    }

    // DTO cho chi tiết phòng (đầy đủ thông tin)
    public class RoomDetailDto
    {
        public int RoomId { get; set; }
        public string RoomCode { get; set; }
        public string RoomName { get; set; }
        public int Capacity { get; set; }
        public int? Floor { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }

        // Thông tin loại phòng
        public string RoomTypeName { get; set; }
        public decimal? PricePerHour { get; set; }

        // Danh sách máy tính trong phòng (nếu cần hiển thị chi tiết)
        public List<ComputerDto> Computers { get; set; }
    }

    public class ComputerDto
    {
        public int ComputerId { get; set; }
        public string ComputerName { get; set; }
        public string Specifications { get; set; }
        public string Status { get; set; }
    }
}
