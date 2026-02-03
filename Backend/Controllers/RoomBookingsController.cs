using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomBookingsController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;

        public RoomBookingsController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // POST: api/RoomBookings
        [HttpPost]
        // SỬA: Đổi kiểu trả về thành BookingResponseDto cho khớp với biến responseDto bên dưới
        public async Task<ActionResult<BookingResponseDto>> PostRoomBooking(CreateBookingDto dto)
        {
            // 1. Kiểm tra dữ liệu đầu vào
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserId == dto.UserId);

            var room = await _context.Rooms.FindAsync(dto.RoomId);

            if (user == null) return BadRequest(new { message = "Người dùng không tồn tại." });
            if (room == null) return BadRequest(new { message = "Phòng máy không tồn tại." });
            if (dto.StartTime >= dto.EndTime) return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu." });

            // 2. Chuyển đổi DateTime sang DateOnly
            DateOnly bookingDateOnly = DateOnly.FromDateTime(dto.BookingDate);

            // 3. Logic kiểm tra trùng lịch
            var conflictingBooking = await _context.RoomBookings
                .Where(b => b.RoomId == dto.RoomId
                         && b.BookingDate == bookingDateOnly
                         && b.Status != "Rejected"
                         && b.Status != "Cancelled"
                         && (dto.StartTime < b.EndTime && dto.EndTime > b.StartTime))
                .FirstOrDefaultAsync();

            if (conflictingBooking != null)
            {
                return BadRequest(new { message = $"Phòng đã bận từ {conflictingBooking.StartTime:HH:mm} đến {conflictingBooking.EndTime:HH:mm}" });
            }

            // 4. Xác định trạng thái duyệt
            bool isLecturer = user.IsTeacher == true ||
                              (user.Role != null && (user.Role.RoleName == "Lecturer" || user.Role.RoleName == "Giảng viên"));
            string status = isLecturer ? "Approved" : "Pending";

            // 5. Lưu xuống Database (Lưu Entity gốc)
            var roomBooking = new RoomBooking
            {
                UserId = dto.UserId,
                RoomId = dto.RoomId,
                BookingDate = bookingDateOnly,
                Purpose = dto.Purpose,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = status,
                NumberOfPeople = 1
            };

            _context.RoomBookings.Add(roomBooking);
            await _context.SaveChangesAsync();

            // 6. Map sang DTO để trả về (CẮT ĐỨT VÒNG LẶP JSON TẠI ĐÂY)
            var responseDto = new BookingResponseDto
            {
                BookingId = roomBooking.BookingId,
                UserId = roomBooking.UserId,
                RoomId = roomBooking.RoomId,
                BookingDate = roomBooking.BookingDate,
                Purpose = roomBooking.Purpose,
                StartTime = roomBooking.StartTime,
                EndTime = roomBooking.EndTime,
                Status = roomBooking.Status
            };

            // Trả về DTO thay vì Entity
            return CreatedAtAction("GetRoomBooking", new { id = roomBooking.BookingId }, responseDto);
        }

        // GET: api/RoomBookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomBooking>> GetRoomBooking(int id)
        {
            var roomBooking = await _context.RoomBookings.FindAsync(id);
            if (roomBooking == null) return NotFound();

            return roomBooking;
        }
    }
}