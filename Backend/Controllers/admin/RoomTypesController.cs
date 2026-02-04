using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class RoomTypesController : ControllerBase
    {
        private readonly QuanLyPhongMayContext _context;

        public RoomTypesController(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        // GET: api/RoomTypes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetRoomTypes()
        {
            // Select ra DTO ẩn danh bao gồm cả số lượng phòng đang dùng loại này
            // Giúp Frontend biết được loại nào đang "bận", loại nào "rảnh"
            var types = await _context.RoomTypes
                .Select(rt => new
                {
                    rt.RoomTypeId,
                    rt.TypeName,
                    rt.BasePrice,
                    UsedCount = rt.Rooms.Count() // Đếm số phòng đang dùng Type này
                })
                .ToListAsync();

            return Ok(types);
        }

        // POST: api/RoomTypes
        [HttpPost]
        public async Task<ActionResult<RoomType>> PostRoomType(RoomType roomType)
        {
            // Validate: Không cho trùng tên
            if (_context.RoomTypes.Any(rt => rt.TypeName == roomType.TypeName))
            {
                return BadRequest(new { message = "Tên loại phòng này đã tồn tại!" });
            }

            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetRoomTypes", new { id = roomType.RoomTypeId }, roomType);
        }

        // PUT: api/RoomTypes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutRoomType(int id, RoomType roomType)
        {
            if (id != roomType.RoomTypeId) return BadRequest();

            // Validate: Nếu đổi tên, phải check xem tên mới có trùng với loại khác không
            if (_context.RoomTypes.Any(rt => rt.TypeName == roomType.TypeName && rt.RoomTypeId != id))
            {
                return BadRequest(new { message = "Tên loại phòng đã trùng với một loại khác!" });
            }

            _context.Entry(roomType).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/RoomTypes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoomType(int id)
        {
            var roomType = await _context.RoomTypes.Include(rt => rt.Rooms).FirstOrDefaultAsync(rt => rt.RoomTypeId == id);
            if (roomType == null) return NotFound();

            // --- LOGIC QUAN TRỌNG: Ràng buộc dữ liệu ---
            // Nếu có bất kỳ phòng nào đang thuộc loại này, TUYỆT ĐỐI KHÔNG CHO XÓA
            if (roomType.Rooms.Any())
            {
                return BadRequest(new
                {
                    message = $"Không thể xóa! Đang có {roomType.Rooms.Count} phòng thuộc loại '{roomType.TypeName}'. Hãy chuyển các phòng đó sang loại khác trước."
                });
            }

            _context.RoomTypes.Remove(roomType);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}