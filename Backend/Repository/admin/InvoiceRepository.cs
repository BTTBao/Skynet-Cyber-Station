// Backend.Repository.admin.InvoiceRepository
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.admin
{
    public class InvoiceRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public InvoiceRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Lấy toàn bộ hóa đơn với thông tin user, booking và room
        /// </summary>
        public async Task<IEnumerable<InvoiceDto2>> GetInvoicesFullAsync()
        {
            var invoices = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Booking)
                    .ThenInclude(b => b.Room)
                .OrderByDescending(i => i.InvoiceId)
                .ToListAsync();

            var invoiceDtos = invoices.Select(invoice => new InvoiceDto2
            {
                InvoiceID = invoice.InvoiceId,
                TotalAmount = invoice.TotalAmount,
                Deposit = invoice.Deposit,
                Status = invoice.Status,
                PaymentDate = invoice.PaymentDate,
                BookingID = invoice.BookingId,
                User = new UserInfoDto
                {
                    FullName = invoice.User?.FullName,
                    Email = invoice.User?.Email
                },
                Booking = invoice.Booking == null ? null : new BookingInfoDto
                {
                    RoomName = invoice.Booking.Room?.RoomName,
                    RoomCode = invoice.Booking.Room?.RoomCode,
                    NumberOfPeople = invoice.Booking.NumberOfPeople ?? 0,
                    BookingDate = invoice.Booking.BookingDate,
                    StartTime = invoice.Booking.StartTime ?? DateTime.MinValue,
                    EndTime = invoice.Booking.EndTime ?? DateTime.MinValue,
                    Purpose = invoice.Booking.Purpose
                }
            }).ToList();

            return invoiceDtos;
        }

        /// <summary>
        /// Tạo hóa đơn mới
        /// </summary>
        public async Task<Invoice> CreateInvoiceAsync(CreateInvoiceDto createInvoiceDto)
        {
            // Kiểm tra Booking có tồn tại không VÀ LẤY LUÔN UserID
            var booking = await _context.RoomBookings
                .FirstOrDefaultAsync(b => b.BookingId == createInvoiceDto.BookingID);

            if (booking == null)
            {
                throw new Exception($"Booking với ID {createInvoiceDto.BookingID} không tồn tại");
            }

            // Kiểm tra xem booking đã có hóa đơn chưa
            var existingInvoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.BookingId == createInvoiceDto.BookingID);

            if (existingInvoice != null)
            {
                throw new Exception($"Booking ID {createInvoiceDto.BookingID} đã có hóa đơn");
            }

            // Tạo entity Invoice mới - LẤY UserID TỪ BOOKING
            var invoice = new Invoice
            {
                BookingId = createInvoiceDto.BookingID,
                UserId = booking.UserId,  // ← LẤY TỪ BOOKING
                TotalAmount = createInvoiceDto.TotalAmount,
                Deposit = createInvoiceDto.Deposit,
                Status = createInvoiceDto.Status ?? "Chưa thanh toán",
                PaymentDate = createInvoiceDto.PaymentDate,
            };

            // Thêm vào database
            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return invoice;
        }

        /// <summary>
        /// Lấy thông tin chi tiết một hóa đơn theo ID
        /// </summary>
        public async Task<InvoiceDto2> GetInvoiceByIdAsync(int invoiceId)
        {
            var invoice = await _context.Invoices
                .Include(i => i.User)
                .Include(i => i.Booking)
                    .ThenInclude(b => b.Room)
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
            {
                return null;
            }

            return new InvoiceDto2
            {
                InvoiceID = invoice.InvoiceId,
                TotalAmount = invoice.TotalAmount,
                Deposit = invoice.Deposit,
                Status = invoice.Status,
                PaymentDate = invoice.PaymentDate,
                BookingID = invoice.BookingId,
                User = new UserInfoDto
                {
                    FullName = invoice.User?.FullName,
                    Email = invoice.User?.Email
                },
                Booking = invoice.Booking == null ? null : new BookingInfoDto
                {
                    RoomName = invoice.Booking.Room?.RoomName,
                    RoomCode = invoice.Booking.Room?.RoomCode,
                    NumberOfPeople = invoice.Booking.NumberOfPeople ?? 0,
                    BookingDate = invoice.Booking.BookingDate,
                    StartTime = invoice.Booking.StartTime ?? DateTime.MinValue,
                    EndTime = invoice.Booking.EndTime ?? DateTime.MinValue,
                    Purpose = invoice.Booking.Purpose
                }
            };
        }

        /// <summary>
        /// Xác nhận thanh toán hóa đơn - Cập nhật trạng thái và ngày thanh toán
        /// </summary>
        public async Task<Invoice> ConfirmPaymentAsync(int invoiceId)
        {
            var invoice = await _context.Invoices
                .FirstOrDefaultAsync(i => i.InvoiceId == invoiceId);

            if (invoice == null)
            {
                throw new Exception($"Không tìm thấy hóa đơn với ID {invoiceId}");
            }

            // Cập nhật trạng thái và ngày thanh toán
            invoice.Status = "paid";
            invoice.PaymentDate = DateTime.Now; // Set ngày thanh toán là thời điểm hiện tại

            _context.Invoices.Update(invoice);
            await _context.SaveChangesAsync();

            return invoice;
        }
    }
}