using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Repository.admin
{
    // ─── Interface ───────────────────────────────────────────────────────
    public interface IBookingRepository
    {
        Task<List<RoomBooking>> GetAllAsync();
        Task<RoomBooking> GetByIdAsync(int bookingId);
        Task<List<RoomBooking>> SearchAsync(string searchTerm);
        Task<RoomBooking> UpdateStatusAsync(int bookingId, string status, string rejectionReason = null);
        Task<RoomBooking> MarkAsUsedAsync(int bookingId);   // ← thêm: đánh dấu phòng đã được dùng
        Task<Dictionary<string, int>> GetStatisticsAsync();
    }

    // ─── Implementation ──────────────────────────────────────────────────
    public class BookingRepository : IBookingRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public BookingRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // ── base query: luôn include User + Room ─────────────────────────
        private IQueryable<RoomBooking> BaseQuery()
        {
            return _context.RoomBookings
                .Include(b => b.User)
                .Include(b => b.Room);
        }

        /// <summary>
        /// Lấy toàn bộ danh sách, sắp xếp mới nhất trên đầu
        /// </summary>
        public async Task<List<RoomBooking>> GetAllAsync()
        {
            return await BaseQuery()
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.BookingId)
                .ToListAsync();
        }

        /// <summary>
        /// Lấy 1 record theo PK
        /// </summary>
        public async Task<RoomBooking> GetByIdAsync(int bookingId)
        {
            return await BaseQuery()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);
        }

        /// <summary>
        /// Tìm kiếm theo: tên người đặt, mã booking (BK-xxxx), mã phòng, mục đích.
        /// Nếu searchTerm rỗng → trả về toàn bộ.
        /// </summary>
        public async Task<List<RoomBooking>> SearchAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetAllAsync();

            var term = searchTerm.Trim().ToLower();

            // Nếu user search "BK-1005" → extract số "1005" → so với BookingId
            int? searchId = null;
            if (term.StartsWith("bk-") && int.TryParse(term.Substring(3), out var parsed))
                searchId = parsed;

            return await BaseQuery()
                .Where(b =>
                    b.User.FullName.ToLower().Contains(term) ||
                    b.Room.RoomCode.ToLower().Contains(term) ||
                    (b.Purpose != null && b.Purpose.ToLower().Contains(term)) ||
                    (searchId.HasValue && b.BookingId == searchId.Value) ||
                    b.BookingId.ToString().Contains(term)                            // fallback: tìm theo số ID
                )
                .OrderByDescending(b => b.BookingDate)
                .ThenByDescending(b => b.BookingId)
                .ToListAsync();
        }

        /// <summary>
        /// Cập nhật Status (approve / reject).
        /// Nếu reject → lưu RejectionReason.
        /// Nếu approve → xóa RejectionReason cũ.
        /// </summary>
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
                booking.RejectionReason = null; // xóa reason cũ nếu duyệt lại

            await _context.SaveChangesAsync();
            return booking;
        }

        /// <summary>
        /// Đánh dấu booking đã được sử dụng phòng: set IsUsed = true.
        /// Chỉ gọi khi status đã là "approved".
        /// </summary>
        public async Task<RoomBooking> MarkAsUsedAsync(int bookingId)
        {
            var booking = await BaseQuery()
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null)
                return null;

            booking.IsUsed = true;

            await _context.SaveChangesAsync();
            return booking;
        }

        /// <summary>
        /// Đếm theo trạng thái → return dictionary { total, pending, approved, rejected }
        /// </summary>
        public async Task<Dictionary<string, int>> GetStatisticsAsync()
        {
            // 1 query group-by thay vì 4 query count riêng
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