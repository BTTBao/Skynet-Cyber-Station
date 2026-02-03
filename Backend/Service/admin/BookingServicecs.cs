using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;

namespace Backend.Service
{
    // ─── Interface ───────────────────────────────────────────────────────
    public interface IBookingService
    {
        Task<List<BookingDto2>> GetAllBookingsAsync();
        Task<List<BookingDto2>> SearchBookingsAsync(string searchTerm);
        Task<BookingDto2> ApproveBookingAsync(int bookingId);
        Task<BookingDto2> RejectBookingAsync(int bookingId, RejectBookingDto rejectDto);
        Task<BookingDto2> MarkBookingAsUsedAsync(int bookingId);   // ← thêm
        Task<BookingStatisticsDto> GetBookingStatisticsAsync();
    }

    // ─── Implementation ──────────────────────────────────────────────────
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingService(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        // ── Lấy toàn bộ danh sách ─────────────────────────────────────────
        public async Task<List<BookingDto2>> GetAllBookingsAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            return bookings.Select(MapToDto).ToList();
        }

        // ── Tìm kiếm ──────────────────────────────────────────────────────
        public async Task<List<BookingDto2>> SearchBookingsAsync(string searchTerm)
        {
            var bookings = await _bookingRepository.SearchAsync(searchTerm);
            return bookings.Select(MapToDto).ToList();
        }

        // ── Duyệt đặt phòng ──────────────────────────────────────────────
        // Chỉ duyệt được nếu status hiện tại là "pending"
        public async Task<BookingDto2> ApproveBookingAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                throw new Exception("Không tìm thấy yêu cầu đặt phòng");

            if ((booking.Status ?? "pending").ToLower() != "pending")
                throw new Exception("Chỉ có thể duyệt yêu cầu đang ở trạng thái 'Chờ duyệt'");

            var updated = await _bookingRepository.UpdateStatusAsync(bookingId, "approved");
            return MapToDto(updated);
        }

        // ── Từ chối đặt phòng ─────────────────────────────────────────────
        // Chỉ từ chối được nếu status hiện tại là "pending"
        public async Task<BookingDto2> RejectBookingAsync(int bookingId, RejectBookingDto rejectDto)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                throw new Exception("Không tìm thấy yêu cầu đặt phòng");

            if ((booking.Status ?? "pending").ToLower() != "pending")
                throw new Exception("Chỉ có thể từ chối yêu cầu đang ở trạng thái 'Chờ duyệt'");

            if (string.IsNullOrWhiteSpace(rejectDto.Reason))
                throw new Exception("Phải nhập lý do từ chối");

            var updated = await _bookingRepository.UpdateStatusAsync(bookingId, "rejected", rejectDto.Reason.Trim());
            return MapToDto(updated);
        }

        // ── Đánh dấu phòng đã được dùng ──────────────────────────────────
        // Chỉ cho mark used nếu status đã là "approved" và IsUsed chưa true
        public async Task<BookingDto2> MarkBookingAsUsedAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                throw new Exception("Không tìm thấy yêu cầu đặt phòng");

            if ((booking.Status ?? "pending").ToLower() != "approved")
                throw new Exception("Chỉ có thể đánh dấu sử dụng khi đặt phòng đã được duyệt");

            if (booking.IsUsed == true)
                throw new Exception("Phòng này đã được đánh dấu là đã sử dụng");

            var updated = await _bookingRepository.MarkAsUsedAsync(bookingId);
            return MapToDto(updated);
        }

        public async Task<BookingStatisticsDto> GetBookingStatisticsAsync()
        {
            var stats = await _bookingRepository.GetStatisticsAsync();

            return new BookingStatisticsDto
            {
                Total    = stats.GetValueOrDefault("total",    0),
                Pending  = stats.GetValueOrDefault("pending",  0),
                Approved = stats.GetValueOrDefault("approved", 0),
                Rejected = stats.GetValueOrDefault("rejected", 0)
            };
        }


        private static BookingDto2 MapToDto(RoomBooking booking)
        {
            return new BookingDto2
            {
                Id = booking.BookingId,

                // Code sinh động: BK- + BookingId padded 4 chữ số → BK-0001, BK-0023, BK-1005
                Code = $"BK-{booking.BookingId:D4}",

                // Lấy FullName từ navigation property User
                Name = booking.User?.FullName ?? "Không xác định",

                // Lấy RoomCode từ navigation property Room
                RoomCode = booking.Room?.RoomCode ?? "N/A",

                // BookingDate (DateOnly) → format "dd/MM/yyyy"
                Date = booking.BookingDate.ToString("dd/MM/yyyy"),

                // StartTime (DateTime?) → format "HH:mm"
                // Nếu null → hiển thị "--:--"
                TimeIn = booking.StartTime?.ToString("HH:mm") ?? "--:--",
                TimeOut = booking.EndTime?.ToString("HH:mm") ?? "--:--",

                // NumberOfPeople (int?) → default 0
                People = booking.NumberOfPeople ?? 0,

                Purpose = booking.Purpose ?? "",

                // Status: normalize lowercase, default "pending" nếu null
                Status = (booking.Status ?? "pending").ToLower(),

                // RejectionReason → trả về null-safe string
                RejectedReason = booking.RejectionReason ?? "",

                // CreatedAt: entity không có field CreatedAt → dùng BookingDate fallback
                CreatedAt = booking.BookingDate.ToString("dd/MM/yyyy"),

                // IsUsed: null → false
                IsUsed = booking.IsUsed ?? false
            };
        }
    }
}