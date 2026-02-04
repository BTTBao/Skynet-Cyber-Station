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
        public async Task<IActionResult> PostRoomBooking(CreateBookingDto dto)
        {
            // 1. Validate & Get Data (Giữ nguyên)
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.RoomId == dto.RoomId);

            if (user == null || room == null) return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            if (dto.StartTime >= dto.EndTime) return BadRequest(new { message = "Thời gian không hợp lệ." });

            DateOnly bookingDateOnly = DateOnly.FromDateTime(dto.BookingDate);

            // 2. Check trùng lịch (Giữ nguyên)
            var conflictingBooking = await _context.RoomBookings
                .Where(b => b.RoomId == dto.RoomId && b.BookingDate == bookingDateOnly
                         && b.Status != "Rejected" && b.Status != "Cancelled"
                         && (dto.StartTime < b.EndTime && dto.EndTime > b.StartTime))
                .FirstOrDefaultAsync();

            if (conflictingBooking != null)
                return BadRequest(new { message = "Phòng đã bận trong khung giờ này." });

            // 3. Tạo Booking
            bool isLecturer = user.IsTeacher == true || (user.Role?.RoleName == "Lecturer");
            var roomBooking = new RoomBooking
            {
                UserId = dto.UserId,
                RoomId = dto.RoomId,
                BookingDate = bookingDateOnly,
                Purpose = dto.Purpose,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = isLecturer ? "Approved" : "Pending", // Giảng viên thì duyệt luôn
                IsUsed = false
            };

            _context.RoomBookings.Add(roomBooking);
            await _context.SaveChangesAsync();

            // 4. TÍNH TIỀN & CỌC (LOGIC MỚI)
            double durationHours = (dto.EndTime - dto.StartTime).TotalHours;
            decimal pricePerHour = room.RoomType?.BasePrice ?? 0;

            // Tổng tiền thuê
            decimal totalAmount = isLecturer ? 0 : (decimal)durationHours * pricePerHour;

            // Tiền cọc = 30% Tổng tiền (Nếu là sinh viên/khách)
            decimal depositAmount = isLecturer ? 0 : totalAmount * 0.3m;

            var invoice = new Invoice
            {
                BookingId = roomBooking.BookingId,
                UserId = dto.UserId,
                TotalAmount = totalAmount,
                Deposit = depositAmount, // <--- LƯU 30% VÀO ĐÂY
                Status = isLecturer ? "Paid" : "Unpaid",
                PaymentDate = isLecturer ? DateTime.Now : null
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRoomBooking", new { id = roomBooking.BookingId }, new
            {
                bookingId = roomBooking.BookingId,
                invoiceId = invoice.InvoiceId,
                message = "Đặt phòng thành công"
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomBooking>> GetRoomBooking(int id)
        {
            var booking = await _context.RoomBookings.FindAsync(id);
            if (booking == null) return NotFound();
            return booking;
        }
    }
}