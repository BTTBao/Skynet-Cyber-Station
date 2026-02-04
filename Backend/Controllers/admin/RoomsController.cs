using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        private readonly ILogger<RoomsController> _logger;

        public RoomsController(IRoomService roomService, ILogger<RoomsController> logger)
        {
            _roomService = roomService;
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
                    new { id = room.RoomID },
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
