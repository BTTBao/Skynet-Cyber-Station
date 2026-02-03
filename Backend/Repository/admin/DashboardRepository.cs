using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Repository.admin
{
    // Repositories/IDashboardRepository.cs
    public interface IDashboardRepository
    {
        Task<DashboardStatisticsDto> GetDashboardStatisticsAsync();
        Task<List<RevenueByDateDto>> GetRevenueLast7DaysAsync();
        Task<List<TopBookedRoomDto>> GetTopBookedRoomsAsync(int limit = 5);
        Task<List<TopRevenueRoomDto>> GetTopRevenueRoomsAsync(int limit = 5);
    }

    // Repositories/DashboardRepository.cs
    public class DashboardRepository : IDashboardRepository
    {
        private readonly QuanLyPhongMayContext _context;

        public DashboardRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        public async Task<DashboardStatisticsDto> GetDashboardStatisticsAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            // Doanh thu hôm nay
            var todayRevenue = await _context.Invoices
                .Where(i => i.Status == "paid")
                .SumAsync(i => (decimal?)i.TotalAmount) ?? 0;

            // Lượt book hôm nay
            var todayBookings = await _context.RoomBookings
                .Where(b => b.Status.ToLower() != "rejected")
                .CountAsync();

            // Phòng đang hoạt động (có booking trong hôm nay và status = Đã duyệt)
            var activeRooms = await _context.RoomBookings
                .Where(b => b.BookingDate == today &&
                           b.Status.ToLower() == "approved" &&
                           b.StartTime <= DateTime.Now &&
                           b.EndTime >= DateTime.Now)
                .Select(b => b.RoomId)
                .Distinct()
                .CountAsync();

            // Tổng số phòng
            var totalRooms = await _context.Rooms
                .Where(r => r.Status == "Active")
                .CountAsync();

            return new DashboardStatisticsDto
            {
                TodayRevenue = todayRevenue,
                TodayBookings = todayBookings,
                ActiveRooms = activeRooms,
                TotalRooms = totalRooms
            };
        }

        public async Task<List<RevenueByDateDto>> GetRevenueLast7DaysAsync()
        {
            var today = DateTime.Today;
            var endDate = DateOnly.FromDateTime(today);
            var startDate = DateOnly.FromDateTime(today.AddDays(-6));

            // Lấy dữ liệu doanh thu từ invoices
            var revenueData = await _context.Invoices
                .Where(i => i.Status == "paid" &&
                           i.PaymentDate.HasValue)
                .ToListAsync(); // Fetch to memory first

            var revenueGrouped = revenueData
                .Where(i => DateOnly.FromDateTime(i.PaymentDate!.Value) >= startDate &&
                           DateOnly.FromDateTime(i.PaymentDate!.Value) <= endDate)
                .GroupBy(i => DateOnly.FromDateTime(i.PaymentDate!.Value))
                .Select(g => new
                {
                    Date = g.Key,
                    Revenue = g.Sum(i => i.TotalAmount),
                    InvoiceCount = g.Count()
                })
                .ToList();

            // Lấy dữ liệu booking
            var bookingsData = await _context.RoomBookings
                .Where(b => b.BookingDate >= startDate &&
                           b.BookingDate <= endDate &&
                           b.Status.ToLower() == "approved")
                .GroupBy(b => b.BookingDate)
                .Select(g => new
                {
                    Date = g.Key,
                    Bookings = g.Count()
                })
                .ToListAsync();

            // Tạo danh sách đầy đủ 7 ngày
            var result = new List<RevenueByDateDto>();
            for (int i = 0; i < 7; i++)
            {
                var date = startDate.AddDays(i);
                var revenue = revenueGrouped.FirstOrDefault(r => r.Date == date);
                var bookings = bookingsData.FirstOrDefault(b => b.Date == date);

                result.Add(new RevenueByDateDto
                {
                    Date = date.ToDateTime(TimeOnly.MinValue),
                    Day = GetDayName(date.DayOfWeek),
                    Revenue = revenue?.Revenue ?? 0,
                    Bookings = bookings?.Bookings ?? 0
                });
            }

            return result;
        }

        public async Task<List<TopBookedRoomDto>> GetTopBookedRoomsAsync(int limit = 5)
        {
            var topRooms = await _context.RoomBookings
                .Where(b => b.Status.ToLower() != "rejected")
                .GroupBy(b => new { b.RoomId, b.Room.RoomName, b.Room.Floor, b.Room.Capacity })
                .Select(g => new TopBookedRoomDto
                {
                    RoomID = g.Key.RoomId,
                    RoomName = g.Key.RoomName,
                    Floor = $"Tầng {g.Key.Floor}",
                    Capacity = g.Key.Capacity,
                    Bookings = g.Count()
                })
                .OrderByDescending(r => r.Bookings)
                .Take(limit)
                .ToListAsync();

            return topRooms;
        }

        public async Task<List<TopRevenueRoomDto>> GetTopRevenueRoomsAsync(int limit = 5)
        {
            var topRooms = await _context.Invoices
                .Where(i => i.Status == "paid")
                .Join(_context.RoomBookings,
                    invoice => invoice.BookingId,
                    booking => booking.BookingId,
                    (invoice, booking) => new { invoice, booking })
                .Where(x => x.booking.Status.ToLower() == "approved")
                .GroupBy(x => new
                {
                    x.booking.RoomId,
                    x.booking.Room.RoomName,
                    x.booking.Room.Floor
                })
                .Select(g => new
                {
                    RoomID = g.Key.RoomId,
                    RoomName = g.Key.RoomName,
                    Floor = g.Key.Floor,
                    Revenue = g.Sum(x => x.invoice.TotalAmount),
                    TotalHours = g.Sum(x =>
                        EF.Functions.DateDiffHour(x.booking.StartTime, x.booking.EndTime))
                })
                .OrderByDescending(r => r.Revenue)
                .Take(limit)
                .ToListAsync();

            return topRooms.Select(r => new TopRevenueRoomDto
            {
                RoomID = r.RoomID,
                RoomName = r.RoomName,
                Floor = $"Tầng {r.Floor}",
                Revenue = r.Revenue,
                Hours = r.TotalHours ?? 0
            }).ToList();
        }

        private string GetDayName(DayOfWeek dayOfWeek)
        {
            return dayOfWeek switch
            {
                DayOfWeek.Monday => "T2",
                DayOfWeek.Tuesday => "T3",
                DayOfWeek.Wednesday => "T4",
                DayOfWeek.Thursday => "T5",
                DayOfWeek.Friday => "T6",
                DayOfWeek.Saturday => "T7",
                DayOfWeek.Sunday => "CN",
                _ => ""
            };
        }
    }
}