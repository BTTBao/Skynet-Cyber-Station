using Backend.DTOs;
using Backend.Service;
using Microsoft.AspNetCore.Mvc;


namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RTController : ControllerBase
    {
        private readonly RTService _roomTypeService;

        public RTController(RTService roomTypeService)
        {
            _roomTypeService = roomTypeService;
        }

        // GET: api/roomtypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RoomTypeDTO>>> GetAllRoomTypes()
        {
            try
            {
                var roomTypes = await _roomTypeService.GetAllRoomTypesAsync();
                return Ok(roomTypes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách loại phòng", error = ex.Message });
            }
        }

        // GET: api/roomtypes/5
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomTypeDTO>> GetRoomType(int id)
        {
            try
            {
                var roomType = await _roomTypeService.GetRoomTypeByIdAsync(id);
                if (roomType == null)
                    return NotFound(new { message = "Không tìm thấy loại phòng" });

                return Ok(roomType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin loại phòng", error = ex.Message });
            }
        }

        // POST: api/roomtypes
        [HttpPost]
        public async Task<ActionResult<RoomTypeDTO>> CreateRoomType([FromBody] RoomTypeDTO roomTypeDto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(roomTypeDto.TypeName))
                    return BadRequest(new { message = "Tên loại phòng không được để trống" });

                var created = await _roomTypeService.CreateRoomTypeAsync(roomTypeDto);
                return CreatedAtAction(nameof(GetRoomType), new { id = created.RoomTypeID }, created);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo loại phòng", error = ex.Message });
            }
        }
    }
}