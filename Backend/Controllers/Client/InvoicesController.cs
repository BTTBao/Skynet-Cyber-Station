using Backend.DTOs;
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
    [Authorize]
    public class InvoicesController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;
        private readonly IEmailService _emailService;

        public InvoicesController(QuanLyPhongMayContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // ==========================================
        // 1. GET INVOICE (Đã tối ưu & Bảo mật)
        // ==========================================
        [HttpGet("{id}")]
        public async Task<ActionResult<InvoiceDetailDTO>> GetInvoice(int id)
        {
            // Lấy ID người dùng hiện tại
            int currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized(new { message = "Token không hợp lệ" });

            // Query dữ liệu
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
                    UserId = i.UserId, // Cần trường này để check quyền

                    User = new InvoiceUserDto
                    {
                        FullName = i.User.FullName,
                        Email = i.User.Email,
                        Department = i.User.Department
                    },
                    Booking = new InvoiceBookingDto
                    {
                        BookingDate = i.Booking.BookingDate,
                        StartTime = i.Booking.StartTime,
                        EndTime = i.Booking.EndTime,
                        Room = new InvoiceRoomDto
                        {
                            RoomName = i.Booking.Room.RoomName,
                            RoomCode = i.Booking.Room.RoomCode,
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

            // --- BẢO MẬT: CHECK QUYỀN SỞ HỮU ---
            // Nếu không phải chủ hóa đơn VÀ không phải Admin -> Chặn ngay
            if (invoiceDto.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return StatusCode(403, new { message = "Bạn không có quyền xem hóa đơn này." });
            }
            // ------------------------------------

            return Ok(invoiceDto);
        }

        // ==========================================
        // 2. PAY INVOICE (Đã vá lỗi IDOR)
        // ==========================================
        [HttpPost("{id}/pay")]
        public async Task<IActionResult> PayInvoice(int id)
        {
            int currentUserId = GetCurrentUserId();
            if (currentUserId == 0) return Unauthorized();

            // 1. Lấy hóa đơn kèm theo Booking
            var invoice = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Booking).ThenInclude(b => b.Room) // Đã include Booking ở đây
                .FirstOrDefaultAsync(i => i.InvoiceId == id);

            if (invoice == null) return NotFound(new { message = "Không tìm thấy hóa đơn" });

            // 2. BẢO MẬT
            if (invoice.UserId != currentUserId && !User.IsInRole("Admin"))
            {
                return StatusCode(403, new { message = "Bạn không có quyền thanh toán hóa đơn này." });
            }

            if (invoice.Status == "Paid") return BadRequest(new { message = "Hóa đơn này đã được thanh toán rồi." });

            // 3. Xử lý thanh toán
            invoice.Status = "Paid";
            invoice.PaymentDate = DateTime.Now;

            // --- THÊM MỚI: Cập nhật trạng thái Booking ---
            if (invoice.Booking != null)
            {
                // Chuyển trạng thái Booking sang Approved
                invoice.Booking.Status = "Approved";
            }
            // ---------------------------------------------

            // 4. Lưu xuống DB (Lưu cả Invoice và Booking cùng lúc)
            await _context.SaveChangesAsync();

            // 5. Gửi email
            _= SendPaymentEmailAsync(invoice);

            return Ok(new
            {
                message = "Thanh toán thành công",
                paymentDate = invoice.PaymentDate,
                bookingStatus = invoice.Booking?.Status // Trả về để Frontend biết
            });
        }

        // ==========================================
        // HÀM HELPER (Tách riêng cho gọn code)
        // ==========================================

        // 1. Lấy UserID từ Token an toàn
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return 0;
        }

        // 2. Tách logic gửi mail ra hàm riêng để code chính đỡ rối
        private async Task SendPaymentEmailAsync(Invoice invoice)
        {
            try
            {
                string userEmail = invoice.User.Email;
                string subject = $"[Xác nhận] Đã nhận tiền cọc - Hóa đơn #{invoice.InvoiceId}";
                string depositMoney = invoice.Deposit?.ToString("N0") + " VNĐ";

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

                await _emailService.SendEmailAsync(userEmail, subject, body);
            }
            catch
            {
                // Log lỗi nếu cần thiết (ví dụ dùng Serilog)
            }
        }
    }
}