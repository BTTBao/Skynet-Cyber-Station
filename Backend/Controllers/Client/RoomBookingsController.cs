using Backend.DTOs;
using Backend.Models;
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers.Client
{
    [Route("api/client/[controller]")] // Đổi lại route cho chuẩn client
    [ApiController]
    [Authorize] // 1. BẮT BUỘC: Phải đăng nhập mới được gọi API
    public class RoomBookingsController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;
        private readonly IEmailService _emailService;

        public RoomBookingsController(QuanLyPhongMayContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ==========================================
        // 1. TẠO BOOKING (ĐÃ BẢO MẬT)
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> PostRoomBooking([FromBody] CreateBookingDto dto)
        {
            int currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized(new { message = "Token không hợp lệ." });

            dto.UserId = currentUserId;

            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == currentUserId);
            var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.RoomId == dto.RoomId);

            if (user == null || room == null) return BadRequest(new { message = "Dữ liệu không hợp lệ." });

            if (dto.StartTime >= dto.EndTime)
                return BadRequest(new { message = "Thời gian kết thúc phải sau thời gian bắt đầu." });

            DateOnly bookingDateOnly = DateOnly.FromDateTime(dto.BookingDate);
            DateOnly today = DateOnly.FromDateTime(DateTime.Now);

            TimeOnly nowTime = TimeOnly.FromDateTime(DateTime.Now);
            TimeOnly bookingStart = TimeOnly.FromDateTime(dto.StartTime);

            if (bookingDateOnly < today || (bookingDateOnly == today && bookingStart < nowTime))
            {
                return BadRequest(new { message = "Không thể đặt phòng cho thời gian trong quá khứ." });
            }

            // --- CHECK TRÙNG LỊCH (Logic cũ của bạn giữ nguyên) ---
            var conflictingBooking = await _context.RoomBookings
                .Where(b => b.RoomId == dto.RoomId && b.BookingDate == bookingDateOnly
                         && b.Status != "Rejected"
                         && dto.StartTime < b.EndTime && dto.EndTime > b.StartTime)
                .FirstOrDefaultAsync();

            if (conflictingBooking != null)
                return BadRequest(new { message = "Phòng đã bận trong khung giờ này." });

            bool isLecturer = user.IsTeacher == true || user.Role?.RoleName == "Lecturer";

            var roomBooking = new RoomBooking
            {
                UserId = currentUserId,
                RoomId = dto.RoomId,
                BookingDate = bookingDateOnly,
                Purpose = dto.Purpose,
                NumberOfPeople = room.Capacity,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = "Pending",
                IsUsed = false
            };

            _context.RoomBookings.Add(roomBooking);
            await _context.SaveChangesAsync();

            // --- TÍNH TIỀN ---
            double durationHours = (dto.EndTime - dto.StartTime).TotalHours;
            decimal pricePerHour = room.RoomType?.BasePrice ?? 0;
            decimal totalAmount = isLecturer ? 0 : (decimal)durationHours * pricePerHour;
            decimal depositAmount = isLecturer ? 0 : totalAmount * 0.3m;

            var invoice = new Invoice
            {
                BookingId = roomBooking.BookingId,
                UserId = currentUserId,
                TotalAmount = totalAmount,
                Deposit = depositAmount,
                Status = isLecturer ? "Paid" : "Not yet paid",
                PaymentDate = isLecturer ? DateTime.Now : null
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();


            if (!isLecturer && depositAmount > 0)
            {
                _ = SendBookingEmailAsync(
                    user.Email,
                    user.FullName,
                    room.RoomName,
                    bookingDateOnly,
                    TimeOnly.FromDateTime(dto.StartTime), // <-- Chuyển DateTime sang TimeOnly
                    TimeOnly.FromDateTime(dto.EndTime),   // <-- Chuyển DateTime sang TimeOnly
                    depositAmount,
                    invoice.InvoiceId
                );
            }

            return CreatedAtAction(nameof(GetRoomBooking), new { id = roomBooking.BookingId }, new
            {
                bookingId = roomBooking.BookingId,
                invoiceId = invoice.InvoiceId,
                message = "Đặt phòng thành công"
            });
        }

        // ==========================================
        // 2. XEM CHI TIẾT BOOKING (ĐÃ BẢO MẬT)
        // ==========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomBooking>> GetRoomBooking(int id)
        {
            var booking = await _context.RoomBookings
                .Include(b => b.Room) // Include thêm thông tin phòng nếu cần hiển thị
                .FirstOrDefaultAsync(b => b.BookingId == id);

            if (booking == null) return NotFound(new { message = "Không tìm thấy đơn đặt phòng." });

            // --- CHECK QUYỀN SỞ HỮU ---
            // Chỉ cho phép xem nếu là chủ đơn HOẶC là Admin
            int currentUserId = GetCurrentUserId();
            if (booking.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return StatusCode(403, new { message = "Bạn không có quyền xem đơn đặt phòng của người khác." });
            }
            // --------------------------

            return booking;
        }

        // ==========================================
        // 3. CÁC HÀM HELPER
        // ==========================================

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }

        // Tách hàm gửi mail ra cho gọn code chính
        private async Task SendBookingEmailAsync(string email, string fullName, string roomName, DateOnly date, TimeOnly start, TimeOnly end, decimal deposit, int invoiceId)
        {
            try
            {
                string paymentLink = $"http://localhost:5173/checkout/{invoiceId}";
                string subject = $"[Xác nhận] Yêu cầu thanh toán cọc - Phòng {roomName}";
                string body = $@"
                    <div style='font-family: Arial, sans-serif; color: #333;'>
                        <h2 style='color: #271756;'>Đặt phòng thành công!</h2>
                        <p>Xin chào <b>{fullName}</b>,</p>
                        <p>Yêu cầu đặt phòng của bạn đã được ghi nhận.</p>
                        <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px;'>
                            <tr><td><b>Phòng:</b></td><td>{roomName}</td></tr>
                            <tr><td><b>Thời gian:</b></td><td>{date:dd/MM/yyyy} ({start:HH:mm} - {end:HH:mm})</td></tr>
                            <tr><td><b>Cọc (30%):</b></td><td style='color:red; font-weight:bold;'>{deposit:N0} VNĐ</td></tr>
                        </table>
                        <a href='{paymentLink}' style='background-color:#271756; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;'>THANH TOÁN NGAY</a>
                    </div>";

                await _emailService.SendEmailAsync(email, subject, body);
            }
            catch
            {
                // Log lỗi (đừng throw ra ngoài để tránh crash API)
            }
        }
    }
}