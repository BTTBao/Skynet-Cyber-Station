using Backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers.Client
{
    [Route("api/client/[controller]")]
    [ApiController]
    public class BookingController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;

        public BookingController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // GET: api/Booking
        // Lấy danh sách booking (Approved, Pending, InUse) để hiển thị lịch
        [HttpGet]
        public async Task<IActionResult> GetBookings()
        {
            try
            {
                // Lấy các booking không bị từ chối (REJECTED) hoặc đã hủy (CANCELLED)
                // Tùy vào logic Enum của bạn, hãy điều chỉnh điều kiện Where
                var bookings = await _context.RoomBookings
                    .Include(b => b.User)  // Join bảng User để lấy tên
                    .Include(b => b.Room)  // Join bảng Room để lấy tên phòng
                    .Where(b => b.Status == "Booked" || b.Status == "InUse")
                    .Select(b => new
                    {
                        id = b.BookingId,
                        roomId = b.RoomId,
                        roomName = b.Room.RoomName,
                        userId = b.UserId,
                        userName = b.User.FullName, // Giả sử User có trường FullName

                        // QUAN TRỌNG: Format dữ liệu khớp với TimeGrid.jsx
                        // 1. Date: Frontend dùng parseISO(b.date), nên trả về string "yyyy-MM-dd"
                        date = b.BookingDate.ToString("yyyy-MM-dd"),

                        // 2. Time: TimeGrid.jsx dùng số nguyên (ví dụ: 7, 8, 9)
                        startTime = b.StartTime,
                        endTime = b.EndTime,

                        status = b.Status,
                        purpose = b.Purpose
                    })
                    .ToListAsync();

                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi lấy lịch đặt phòng", error = ex.Message });
            }
        }
    }
}