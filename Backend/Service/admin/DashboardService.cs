using Backend.DTOs;
using Backend.Repository.admin;

namespace Backend.Service
{
    // Services/IDashboardService.cs
    public interface IDashboardService
    {
        Task<DashboardDataDto> GetDashboardDataAsync();
    }

    // Services/DashboardService.cs
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _dashboardRepository;

        public DashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<DashboardDataDto> GetDashboardDataAsync()
        {
            var statistics = await _dashboardRepository.GetDashboardStatisticsAsync();
            var revenueLast7Days = await _dashboardRepository.GetRevenueLast7DaysAsync();
            var topBookedRooms = await _dashboardRepository.GetTopBookedRoomsAsync();
            var topRevenueRooms = await _dashboardRepository.GetTopRevenueRoomsAsync();

            // Tính tổng doanh thu và tổng lượt booking của tất cả ngày
            var totalRevenue = revenueLast7Days.Sum(r => r.Revenue);
            var totalBookings = revenueLast7Days.Sum(r => r.Bookings);

            var dashboardData = new DashboardDataDto
            {
                Statistics = statistics,
                RevenueLast7Days = revenueLast7Days,
                TopBookedRooms = topBookedRooms,
                TopRevenueRooms = topRevenueRooms,
                TotalRevenue = totalRevenue,
                TotalBookings = totalBookings
            };

            return dashboardData;
        }
    }
}