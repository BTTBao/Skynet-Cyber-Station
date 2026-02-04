using Backend.DTOs; // <--- Nhớ import DTO
using Backend.Models;
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc có Token mới được vào
    public class InvoicesController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;
        private readonly IEmailService _emailService;

        public InvoicesController(QuanLyPhongMayContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // GET: api/Invoices/5
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDetailDTO>> GetInvoice(int id)
        {
            // 1. Lấy UserID từ Token hiện tại
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("UserId")?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdClaim)) return Unauthorized();
            int currentUserId = int.Parse(userIdClaim);

            // 2. Query và Map sang DTO
            // Sử dụng .Select() thay vì .Include() để tránh lỗi vòng lặp JSON
            var invoiceDto = await _context.Invoices
                .Where(i => i.InvoiceId == id)
                .Select(i => new InvoiceDetailDTO
                {
                    InvoiceId = i.InvoiceId,
                    TotalAmount = i.TotalAmount,
                    Status = i.Status,
                    Deposit = i.Deposit,
                    PaymentDate = i.PaymentDate,
                    BookingId = i.BookingId,
                    UserId = i.UserId,

                    // Map User
                    User = new InvoiceUserDto
                    {
                        FullName = i.User.FullName,
                        Email = i.User.Email,
                        Department = i.User.Department
                    },

                    // Map Booking
                    Booking = new InvoiceBookingDto
                    {
                        BookingDate = i.Booking.BookingDate,
                        StartTime = i.Booking.StartTime,
                        EndTime = i.Booking.EndTime,

                        // Map Room lồng trong Booking
                        Room = new InvoiceRoomDto
                        {
                            RoomName = i.Booking.Room.RoomName,
                            RoomCode = i.Booking.Room.RoomCode,

                            // Map RoomType lồng trong Room
                            RoomType = new InvoiceRoomTypeDto
                            {
                                TypeName = i.Booking.Room.RoomType.TypeName,
                                BasePrice = i.Booking.Room.RoomType.BasePrice
                            }
                        }
                    }
                })
                .FirstOrDefaultAsync();

            if (invoiceDto == null) return NotFound(new { message = "Không tìm thấy hóa đơn." });

            // 3. CHECK QUYỀN: Chỉ chủ hóa đơn hoặc Admin mới được xem
            if (invoiceDto.UserId != currentUserId && userRole != "Admin")
            {
                return StatusCode(403, new { message = "Bạn không có quyền xem hóa đơn này." });
            }

            return Ok(invoiceDto);
        }

        // POST: api/Invoices/5/pay
        [HttpPost("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id)
        {
            // Lấy hóa đơn kèm thông tin User và Phòng để gửi mail
            var invoice = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Booking).ThenInclude(b => b.Room)
                .FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null) return NotFound(new { message = "Không tìm thấy hóa đơn" });
            if (invoice.Status == "Paid") return BadRequest(new { message = "Đã thanh toán rồi" });

            // Xử lý thanh toán
            invoice.Status = "Paid";
            invoice.PaymentDate = DateTime.Now;
            await _context.SaveChangesAsync();

            // --- CODE GỬI MAIL (Thêm đoạn này vào) ---
            try
            {
                string userEmail = invoice.User.Email;
                string subject = $"[Xác nhận] Đã nhận tiền cọc - Hóa đơn #{invoice.InvoiceId}";

                // Format tiền tệ Việt Nam
                string depositMoney = invoice.Deposit?.ToString("N0") + " VNĐ";
                string totalMoney = invoice.TotalAmount.ToString("N0") + " VNĐ";

                string body = $@"
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <h2 style='color: #271756;'>Thanh toán cọc thành công!</h2>
                    <p>Xin chào <b>{invoice.User.FullName}</b>,</p>
                    <p>Hệ thống đã nhận được khoản thanh toán cọc của bạn.</p>
                    
                    <table style='width: 100%; border-collapse: collapse; margin: 20px 0;'>
                        <tr style='background: #f3f4f6;'>
                            <td style='padding: 10px; border: 1px solid #ddd;'><b>Phòng:</b></td>
                            <td style='padding: 10px; border: 1px solid #ddd;'>{invoice.Booking?.Room?.RoomName}</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #ddd;'><b>Số tiền cọc:</b></td>
                            <td style='padding: 10px; border: 1px solid #ddd; color: #d32f2f; font-weight: bold;'>{depositMoney}</td>
                        </tr>
                        <tr>
                            <td style='padding: 10px; border: 1px solid #ddd;'><b>Thời gian:</b></td>
                            <td style='padding: 10px; border: 1px solid #ddd;'>{DateTime.Now:dd/MM/yyyy HH:mm}</td>
                        </tr>
                    </table>

                    <p>Vui lòng đến nhận phòng đúng giờ. Cảm ơn bạn đã sử dụng dịch vụ!</p>
                </div>";

                // Gửi mail (Không await để API phản hồi nhanh hơn cho React)
                _emailService.SendEmailAsync(userEmail, subject, body);
            }
            catch (Exception)
            {
                // Lỗi gửi mail không được làm ảnh hưởng việc thanh toán thành công
            }
            // ------------------------------------------

            return Ok(new { message = "Thanh toán thành công", paymentDate = invoice.PaymentDate });
        }
    }
}