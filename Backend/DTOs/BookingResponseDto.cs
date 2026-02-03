namespace Backend.DTOs
{
    public class BookingResponseDto
    {
        public int BookingId { get; set; }
        public int UserId { get; set; }
        public int RoomId { get; set; }
        public DateOnly BookingDate { get; set; }
        public string? Purpose { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public string? Status { get; set; }
        // Không include User hay Room object ở đây để tránh loop
    }
}