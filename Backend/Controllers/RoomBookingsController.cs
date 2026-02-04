using Backend.DTOs;
using Backend.Models;
using Backend.Service; // 1. Đừng quên dòng này
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RoomBookingsController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;
        private readonly IEmailService _emailService; // 2. Khai báo service gửi mail

        // 3. Inject IEmailService vào Constructor
        public RoomBookingsController(QuanLyPhongMayContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // POST: api/RoomBookings
        [HttpPost]
        public async Task<IActionResult> PostRoomBooking(CreateBookingDto dto)
        {
            // --- 1. Validate & Get Data ---
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == dto.UserId);
            var room = await _context.Rooms.Include(r => r.RoomType).FirstOrDefaultAsync(r => r.RoomId == dto.RoomId);

            if (user == null || room == null) return BadRequest(new { message = "Dữ liệu không hợp lệ." });
            if (dto.StartTime >= dto.EndTime) return BadRequest(new { message = "Thời gian không hợp lệ." });

            DateOnly bookingDateOnly = DateOnly.FromDateTime(dto.BookingDate);

            // --- 2. Check trùng lịch ---
            var conflictingBooking = await _context.RoomBookings
                .Where(b => b.RoomId == dto.RoomId && b.BookingDate == bookingDateOnly
                         && b.Status != "Rejected" && b.Status != "Cancelled"
                         && (dto.StartTime < b.EndTime && dto.EndTime > b.StartTime))
                .FirstOrDefaultAsync();

            if (conflictingBooking != null)
                return BadRequest(new { message = "Phòng đã bận trong khung giờ này." });

            // --- 3. Tạo Booking ---
            bool isLecturer = user.IsTeacher == true || (user.Role?.RoleName == "Lecturer");
            var roomBooking = new RoomBooking
            {
                UserId = dto.UserId,
                RoomId = dto.RoomId,
                BookingDate = bookingDateOnly,
                Purpose = dto.Purpose,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                Status = isLecturer ? "Approved" : "Pending", // Giảng viên duyệt luôn, Sinh viên chờ thanh toán
                IsUsed = false
            };

            _context.RoomBookings.Add(roomBooking);
            await _context.SaveChangesAsync();

            // --- 4. TÍNH TIỀN & CỌC ---
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
                Deposit = depositAmount,
                Status = isLecturer ? "Paid" : "Unpaid", // Giảng viên coi như đã thanh toán (0đ)
                PaymentDate = isLecturer ? DateTime.Now : null
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            // --- 5. GỬI EMAIL THÔNG BÁO ---
            // Chỉ gửi mail yêu cầu thanh toán nếu là Sinh viên/Khách (và số tiền > 0)
            if (!isLecturer && depositAmount > 0)
            {
                try
                {
                    string paymentLink = $"http://localhost:5173/checkout/{invoice.InvoiceId}"; // Link React Frontend của bạn
                    string subject = $"[Xác nhận] Yêu cầu thanh toán cọc - Phòng {room.RoomName}";

                    string body = $@"
                        <div style='font-family: Arial, sans-serif; color: #333;'>
                            <h2 style='color: #271756;'>Đặt phòng thành công!</h2>
                            <p>Xin chào <b>{user.FullName}</b>,</p>
                            <p>Yêu cầu đặt phòng của bạn đã được ghi nhận. Vui lòng thanh toán khoản cọc để giữ chỗ.</p>
                            
                            <table style='width: 100%; max-width: 500px; margin: 20px 0; border-collapse: collapse;'>
                                <tr style='background-color: #f8f9fa;'>
                                    <td style='padding: 10px; border: 1px solid #ddd;'><b>Phòng:</b></td>
                                    <td style='padding: 10px; border: 1px solid #ddd;'>{room.RoomName}</td>
                                </tr>
                                <tr>
                                    <td style='padding: 10px; border: 1px solid #ddd;'><b>Thời gian:</b></td>
                                    <td style='padding: 10px; border: 1px solid #ddd;'>
                                        {bookingDateOnly:dd/MM/yyyy}<br/>
                                        {dto.StartTime:HH:mm} - {dto.EndTime:HH:mm}
                                    </td>
                                </tr>
                                <tr>
                                    <td style='padding: 10px; border: 1px solid #ddd;'><b>Tiền cọc cần đóng (30%):</b></td>
                                    <td style='padding: 10px; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;'>
                                        {depositAmount:N0} VNĐ
                                    </td>
                                </tr>
                            </table>

                            <a href='{paymentLink}' 
                               style='background-color: #271756; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>
                               THANH TOÁN NGAY
                            </a>
                            
                            <p style='margin-top: 20px; font-size: 13px; color: #666;'>
                                <i>Vui lòng thanh toán trong vòng 30 phút để tránh bị hủy đơn.</i>
                            </p>
                        </div>";

                    // Gọi hàm gửi mail (Fire and forget - không cần await để API phản hồi nhanh)
                    _ = _emailService.SendEmailAsync(user.Email, subject, body);
                }
                catch (Exception)
                {
                    // Nếu lỗi gửi mail thì bỏ qua, không chặn luồng đặt phòng
                    // Có thể log lỗi tại đây: Console.WriteLine(ex.Message);
                }
            }
            // -----------------------------

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