using System;

namespace Backend.DTOs
{
    public class CreateBookingDto
    {
        public int UserId { get; set; }
        public int RoomId { get; set; }

        // React gửi string "yyyy-MM-dd", ta nhận bằng DateTime cho an toàn
        // (DateOnly đôi khi bị lỗi parse JSON mặc định)
        public DateTime BookingDate { get; set; }

        public string Purpose { get; set; } = string.Empty;

        // React gửi ISO string (2024-02-28T07:00:00.000Z)
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
}