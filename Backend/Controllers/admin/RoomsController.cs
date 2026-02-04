using Backend.DTOs;
using Backend.Models; // Cần thêm để dùng QuanLyPhongMayContext
using Backend.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Cần thêm để dùng AnyAsync

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly QuanLyPhongMayContext _context; // Inject thêm Context để check booking
        private readonly ILogger<RoomsController> _logger;

        public RoomsController(IRoomService roomService, QuanLyPhongMayContext context, ILogger<RoomsController> logger)
        {
            _roomService = roomService;
            _context = context;
            _logger = logger;
        }

        // GET: api/rooms
        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await _roomService.GetAllRoomsAsync();
            return Ok(rooms);
        }

        // GET: api/rooms/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetRoomById(int id)
        {
            try
            {
                var room = await _roomService.GetRoomByIdAsync(id);
                return Ok(room);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // GET: api/rooms/floor/{floor}
        [HttpGet("floor/{floor}")]
        public async Task<IActionResult> GetRoomsByFloor(int floor)
        {
            try
            {
                var rooms = await _roomService.GetRoomsByFloorAsync(floor);
                return Ok(rooms);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/rooms/type/{typeId}
        [HttpGet("type/{typeId}")]
        public async Task<IActionResult> GetRoomsByType(int typeId)
        {
            var rooms = await _roomService.GetRoomsByTypeAsync(typeId);
            return Ok(rooms);
        }

        // GET: api/rooms/search?searchTerm=
        [HttpGet("search")]
        public async Task<IActionResult> SearchRooms([FromQuery] string searchTerm)
        {
            var rooms = await _roomService.SearchRoomsAsync(searchTerm ?? string.Empty);
            return Ok(rooms);
        }

        // GET: api/rooms/available?startTime=&endTime=
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableRooms(
            [FromQuery] DateTime startTime,
            [FromQuery] DateTime endTime)
        {
            try
            {
                var rooms = await _roomService.GetAvailableRoomsAsync(startTime, endTime);
                return Ok(rooms);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // POST: api/rooms
        [HttpPost]
        public async Task<IActionResult> CreateRoom([FromBody] CreateRoomDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var room = await _roomService.CreateRoomAsync(dto);
                return CreatedAtAction(
                    nameof(GetRoomById),
                    new { id = room.RoomID }, // Lưu ý: RoomID hoặc RoomId tùy model
                    room
                );
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/rooms/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRoom(int id, [FromBody] UpdateRoomDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // --- BẮT ĐẦU ĐOẠN LOGIC CHECK KHÓA PHÒNG ---
            try
            {
                // 1. Lấy trạng thái hiện tại của phòng từ DB
                var existingRoom = await _context.Rooms.AsNoTracking().FirstOrDefaultAsync(r => r.RoomId == id);

                if (existingRoom != null)
                {
                    // 2. Kiểm tra nếu đang chuyển từ Active -> Inactive (hoặc Maintenance)
                    // Giả sử DTO của bạn có trường Status. Nếu không có, bạn cần kiểm tra lại UpdateRoomDto.
                    bool isLocking = (existingRoom.Status == "Active" && (dto.Status == "Inactive" || dto.Status == "Maintenance"));

                    if (isLocking)
                    {
                        // 3. Query kiểm tra lịch đặt phòng trong tương lai
                        bool hasFutureBookings = await _context.RoomBookings.AnyAsync(b =>
                            b.RoomId == id &&
                            b.EndTime.HasValue && b.EndTime.Value > DateTime.Now && // Chưa kết thúc
                            (b.Status == "Approved" || b.Status == "Pending" || b.Status == "Paid") // Đã duyệt hoặc chờ
                        );

                        if (hasFutureBookings)
                        {
                            return BadRequest(new
                            {
                                message = "Không thể khóa phòng này! Đang có lịch đặt phòng trong tương lai chưa hoàn tất.",
                                errorCode = "HAS_FUTURE_BOOKINGS"
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần nhưng không chặn luồng update chính nếu check lỗi
                _logger.LogError(ex, "Lỗi khi kiểm tra booking trong UpdateRoom");
            }
            // --- KẾT THÚC ĐOẠN LOGIC CHECK KHÓA PHÒNG ---

            try
            {
                var room = await _roomService.UpdateRoomAsync(id, dto);
                return Ok(room);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/rooms/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(int id)
        {
            try
            {
                await _roomService.DeleteRoomAsync(id);
                return Ok(new { message = "Xóa phòng thành công" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}