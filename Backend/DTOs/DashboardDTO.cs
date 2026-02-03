namespace Backend.DTOs
{
    // DTOs/DashboardDtos.cs
    public class DashboardStatisticsDto
    {
        public decimal TodayRevenue { get; set; }
        public int TodayBookings { get; set; }
        public int ActiveRooms { get; set; }
        public int TotalRooms { get; set; }
    }

    public class RevenueByDateDto
    {
        public DateTime Date { get; set; }
        public string Day { get; set; }
        public decimal Revenue { get; set; }
        public int Bookings { get; set; }
    }

    public class TopBookedRoomDto
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; }
        public string Floor { get; set; }
        public int Capacity { get; set; }
        public int Bookings { get; set; }
    }

    public class TopRevenueRoomDto
    {
        public int RoomID { get; set; }
        public string RoomName { get; set; }
        public string Floor { get; set; }
        public decimal Revenue { get; set; }
        public int Hours { get; set; }
    }

    public class DashboardDataDto
    {
        public DashboardStatisticsDto Statistics { get; set; }
        public List<RevenueByDateDto> RevenueLast7Days { get; set; }
        public List<TopBookedRoomDto> TopBookedRooms { get; set; }
        public List<TopRevenueRoomDto> TopRevenueRooms { get; set; }
        public decimal TotalRevenue { get; set; }
        public int TotalBookings { get; set; }
    }
}
