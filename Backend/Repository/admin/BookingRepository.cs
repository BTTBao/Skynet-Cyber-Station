// ─── BookingRepository.cs ───────────────────────────────────────────────
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Repository.admin
{
    public interface IBookingRepository
    {
        Task<List<RoomBooking>> GetAllAsync();
        Task<RoomBooking> GetByIdAsync(int bookingId);
        Task<List<RoomBooking>> SearchAsync(string searchTerm);
        Task<RoomBooking> UpdateStatusAsync(int bookingId, string status, string rejectionReason = null);
        Task<RoomBooking> MarkAsUsedAsync(int bookingId, bool isUsed);
        Task<Dictionary<string, int>> GetStatisticsAsync();
    }

    public class BookingRepository : IBookingRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public BookingRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // ── base query: include User + Room + RoomType + Invoices ───────
        private IQueryable<RoomBooking> BaseQuery()
        {
            return _context.RoomBookings
                .Include(b => b.User)
                .Include(b => b.Room)
                    .ThenInclude(r => r.RoomType)
                .Include(b => b.Invoices);  // ← THÊM DÒNG NÀY để load invoices
        }

        public async Task<List<RoomBooking>> GetAllAsync()
        {
            return await BaseQuery()
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.BookingId)
                .ToListAsync();
        }

        public async Task<RoomBooking> GetByIdAsync(int bookingId)
        {
            return await BaseQuery()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        public async Task<List<RoomBooking>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            var term = searchTerm.Trim().ToLower();

            int? searchId = null;
            if (term.StartsWith("bk-") && int.TryParse(term.Substring(3), out var parsed))
                searchId = parsed;

            return await BaseQuery()
                .Where(b =>
                    b.User.FullName.ToLower().Contains(term) ||
                    b.Room.RoomCode.ToLower().Contains(term) ||
                    (b.Purpose != null && b.Purpose.ToLower().Contains(term)) ||
                    (searchId.HasValue && b.BookingId == searchId.Value) ||
                    b.BookingId.ToString().Contains(term)
                )
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.BookingId)
                .ToListAsync();
        }

        public async Task<RoomBooking> UpdateStatusAsync(int bookingId, string status, string rejectionReason = null)
        {
            var booking = await BaseQuery()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                return null;

            booking.Status = status;

            if (status.ToLower() == "rejected")
                booking.RejectionReason = rejectionReason;

            if (status.ToLower() == "approved")
                booking.RejectionReason = null;

            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<RoomBooking> MarkAsUsedAsync(int bookingId, bool isUsed)
        {
            var booking = await BaseQuery()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                return null;

            booking.IsUsed = isUsed;  // ← Set giá trị từ parameter

            await _context.SaveChangesAsync();
            return booking;
        }

        public async Task<Dictionary<string, int>> GetStatisticsAsync()
        {
            var groups = await _context.RoomBookings
                .GroupBy(b => (b.Status ?? "pending").ToLower())
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.Status, g => g.Count);

            int total = groups.Values.Sum();
            int pending = groups.GetValueOrDefault("pending", 0);
            int approved = groups.GetValueOrDefault("approved", 0);
            int rejected = groups.GetValueOrDefault("rejected", 0);

            return new Dictionary<string, int>
            {
                { "total",    total    },
                { "pending",  pending  },
                { "approved", approved },
                { "rejected", rejected }
            };
        }
    }
}