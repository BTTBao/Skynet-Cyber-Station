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
                    .Where(b => b.Status == "Approved" || b.IsUsed == true)
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

        // GET: api/client/Booking/user/5
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetBookingHistoryByUserId(int userId)
        {
            try
            {
                var history = await _context.RoomBookings
                    .Include(b => b.Room)
                        .ThenInclude(r => r.RoomType)
                    .Include(b => b.User)
                    .Where(b => b.UserId == userId)
                    .OrderByDescending(b => b.BookingDate) // Sắp xếp mới nhất lên đầu
                    .ThenByDescending(b => b.StartTime)
                    .Select(b => new
                    {
                        id = b.BookingId,
                        bookingId = b.BookingId, // Thêm để frontend dùng
                        roomId = b.RoomId,
                        roomName = b.Room.RoomName,
                        basePrice = (b.User.Role.RoleName == "Giảng viên") ? 0 : b.Room.RoomType.BasePrice,
                        userId = b.UserId,
                        isUsed = b.IsUsed,

                        // Format ngày hiển thị
                        date = b.BookingDate.ToString("yyyy-MM-dd"),
                        bookingDate = b.BookingDate.ToString("yyyy-MM-dd"), // Thêm để frontend dùng

                        // Lấy giờ (số nguyên) để tính toán logic nếu cần
                        startHour = b.StartTime.HasValue ? b.StartTime.Value.Hour : 0,
                        endHour = b.EndTime.HasValue ? b.EndTime.Value.Hour : 0,

                        // Lấy chuỗi giờ đẹp để hiển thị (VD: "07:00")
                        startTimeStr = b.StartTime.HasValue ? b.StartTime.Value.ToString("HH:mm") : "",
                        endTimeStr = b.EndTime.HasValue ? b.EndTime.Value.ToString("HH:mm") : "",

                        status = b.Status, // Approved, Pending, Rejected...
                        purpose = b.Purpose,
                        rejectionReason = b.RejectionReason // Lý do từ chối (nếu có)
                    })
                    .ToListAsync();

                return Ok(history);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server khi lấy lịch sử đặt phòng", error = ex.Message });
            }
        }

        // GET: api/client/Booking/check-conflicts
        // Kiểm tra xem user có lịch conflict không (cho frontend validation)
        [HttpGet("check-conflicts")]
        public async Task<IActionResult> CheckBookingConflicts(
            [FromQuery] int userId,
            [FromQuery] string date,
            [FromQuery] int startHour,
            [FromQuery] int endHour)
        {
            try
            {
                // Lấy tất cả booking của user trong ngày đó
                var userBookings = await _context.RoomBookings
                    .Where(b => b.UserId == userId 
                        && b.BookingDate.ToString("yyyy-MM-dd") == date
                        && (b.Status == "Pending" || b.Status == "Approved" || b.IsUsed == true))
                    .Select(b => new
                    {
                        startHour = b.StartTime.HasValue ? b.StartTime.Value.Hour : 0,
                        endHour = b.EndTime.HasValue ? b.EndTime.Value.Hour : 0,
                        status = b.Status,
                        isUsed = b.IsUsed
                    })
                    .ToListAsync();

                // Kiểm tra conflict
                bool hasConflict = userBookings.Any(b =>
                    (startHour >= b.startHour && startHour < b.endHour) ||
                    (endHour > b.startHour && endHour <= b.endHour) ||
                    (startHour <= b.startHour && endHour >= b.endHour)
                );

                // Đếm số lượng booking trong ngày
                int bookingCount = userBookings.Count;

                return Ok(new
                {
                    hasConflict = hasConflict,
                    bookingCount = bookingCount,
                    conflictingBookings = hasConflict
                        ? userBookings.Cast<object>().ToList()
                        : new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi kiểm tra conflict", error = ex.Message });
            }
        }
    }
}