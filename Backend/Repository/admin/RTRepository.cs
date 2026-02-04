using Backend.Models;
using Microsoft.EntityFrameworkCore;


namespace Backend.Repository.admin
{
    public class RTRepository 
    {
        private readonly QuanLyPhongMayContext _context;

        public RTRepository(QuanLyPhongMayContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RoomType>> GetAllRoomTypesAsync()
        {
            return await _context.RoomTypes
                .OrderBy(rt => rt.TypeName)
                .ToListAsync();
        }

        public async Task<RoomType> GetRoomTypeByIdAsync(int id)
        {
            return await _context.RoomTypes
                .FirstOrDefaultAsync(rt => rt.RoomTypeId == id);
        }

        public async Task<RoomType> CreateRoomTypeAsync(RoomType roomType)
        {
            _context.RoomTypes.Add(roomType);
            await _context.SaveChangesAsync();
            return roomType;
        }
    }
}