// ─── BookingService.cs ──────────────────────────────────────────────────
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;

namespace Backend.Service
{
    public interface IBookingService
    {
        Task<List<BookingDto2>> GetAllBookingsAsync();
        Task<List<BookingDto2>> SearchBookingsAsync(string searchTerm);
        Task<BookingDto2> ApproveBookingAsync(int bookingId);
        Task<BookingDto2> RejectBookingAsync(int bookingId, RejectBookingDto rejectDto);
        Task<BookingDto2> MarkBookingAsUsedAsync(int bookingId, bool isUsed);
        Task<BookingStatisticsDto> GetBookingStatisticsAsync();
    }

    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;

        public BookingService(IBookingRepository bookingRepository)
        {
            _bookingRepository = bookingRepository;
        }

        public async Task<List<BookingDto2>> GetAllBookingsAsync()
        {
            var bookings = await _bookingRepository.GetAllAsync();
            return bookings.Select(MapToDto).ToList();
        }

        public async Task<List<BookingDto2>> SearchBookingsAsync(string searchTerm)
        {
            var bookings = await _bookingRepository.SearchAsync(searchTerm);
            return bookings.Select(MapToDto).ToList();
        }

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

        // ─── Service Implementation ─────────────────────────────────────────
        public async Task<BookingDto2> MarkBookingAsUsedAsync(int bookingId, bool isUsed)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
                throw new Exception("Không tìm thấy yêu cầu đặt phòng");

            if ((booking.Status ?? "pending").ToLower() != "approved")
                throw new Exception("Chỉ có thể đánh dấu sử dụng khi đặt phòng đã được duyệt");

            // Cho phép cập nhật lại trạng thái (không check IsUsed nữa)
            var updated = await _bookingRepository.MarkAsUsedAsync(bookingId, isUsed);
            return MapToDto(updated);
        }

        public async Task<BookingStatisticsDto> GetBookingStatisticsAsync()
        {
            var stats = await _bookingRepository.GetStatisticsAsync();

            return new BookingStatisticsDto
            {
                Total = stats.GetValueOrDefault("total", 0),
                Pending = stats.GetValueOrDefault("pending", 0),
                Approved = stats.GetValueOrDefault("approved", 0),
                Rejected = stats.GetValueOrDefault("rejected", 0)
            };
        }

        // ── MAP TO DTO ────────────────────────────────────────────────────
        private static BookingDto2 MapToDto(RoomBooking booking)
        {
            // Lấy giá từ Room -> RoomType
            decimal price = 0;
            if (booking.Room?.RoomType != null)
            {
                price = booking.Room.RoomType.BasePrice ?? 0;
            }

            // Kiểm tra xem booking đã có invoice chưa
            bool isBillCreated = booking.Invoices != null && booking.Invoices.Any();

            return new BookingDto2
            {
                Id = booking.BookingId,
                Code = $"BK-{booking.BookingId:D4}",
                Price = price,
                Name = booking.User?.FullName ?? "Không xác định",
                RoomCode = booking.Room?.RoomCode ?? "N/A",
                Date = booking.BookingDate.ToString("dd/MM/yyyy"),
                TimeIn = booking.StartTime?.ToString("HH:mm") ?? "--:--",
                TimeOut = booking.EndTime?.ToString("HH:mm") ?? "--:--",
                People = booking.NumberOfPeople ?? 0,
                Purpose = booking.Purpose ?? "",
                Status = (booking.Status ?? "pending").ToLower(),
                RejectedReason = booking.RejectionReason ?? "",
                CreatedAt = booking.BookingDate.ToString("dd/MM/yyyy"),
                IsUsed = booking.IsUsed ?? false,
                IsBillCreated = isBillCreated  // ← CHECK XEM ĐÃ CÓ HÓA ĐƠN CHƯA
            };
        }
    }
}