using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers.admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// GET /api/bookings
        /// Lấy toàn bộ danh sách đặt phòng
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {
                var bookings = await _bookingService.GetAllBookingsAsync();
                return Ok(new { success = true, data = bookings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/bookings/search?searchTerm=xxx
        /// Tìm kiếm theo tên, mã booking, mã phòng, mục đích
        /// </summary>
        [HttpGet("search")]
        public async Task<IActionResult> SearchBookings([FromQuery] string searchTerm)
        {
            try
            {
                var bookings = await _bookingService.SearchBookingsAsync(searchTerm);
                return Ok(new { success = true, data = bookings });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/bookings/statistics
        /// Lấy thống kê: tổng, chờ duyệt, đã duyệt, từ chối
        /// </summary>
        [HttpGet("statistics")]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _bookingService.GetBookingStatisticsAsync();
                return Ok(new { success = true, data = stats });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// PATCH /api/bookings/{id}/approve
        /// Duyệt yêu cầu đặt phòng (chỉ duyệt được nếu đang "pending")
        /// </summary>
        [HttpPatch("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            try
            {
                var booking = await _bookingService.ApproveBookingAsync(id);
                return Ok(new { success = true, message = "Duyệt đặt phòng thành công", data = booking });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// PATCH /api/bookings/{id}/mark-used
        /// Đánh dấu phòng đã được sử dụng (chỉ khi status = approved, IsUsed chưa true)
        /// </summary>
        [HttpPatch("{id}/mark-used")]
        public async Task<IActionResult> MarkBookingAsUsed(int id)
        {
            try
            {
                var booking = await _bookingService.MarkBookingAsUsedAsync(id);
                return Ok(new { success = true, message = "Đánh dấu phòng đã được sử dụng", data = booking });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// PATCH /api/bookings/{id}/reject
        /// Từ chối yêu cầu đặt phòng, body: { "reason": "lý do" }
        /// </summary>        [HttpPatch("{id}/reject")]
        //public async Task<IActionResult> RejectBooking(int id, [FromBody] RejectBookingDto rejectDto)
        //{
        //    try
        //    {
        //        if (!ModelState.IsValid)
        //            return BadRequest(new { success = false, message = "Dữ liệu không hợp lệ", errors = ModelState });

    }
}