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
                    NumberOfPeople = (int)invoice.Booking.NumberOfPeople,
                    BookingDate = invoice.Booking.BookingDate,
                    StartTime = invoice.Booking.StartTime ?? DateTime.MinValue,
                    EndTime = invoice.Booking.EndTime ?? DateTime.MinValue,
                    Purpose = invoice.Booking.Purpose
                }
            }).ToList();

            return invoiceDtos;
        }
    }
}
