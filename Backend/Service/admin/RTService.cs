using Backend.DTOs;
using Backend.Models;
using Backend.Repository.admin;


namespace Backend.Service
{
    public class RTService 
    {
        private readonly RTRepository _roomTypeRepository;

        public RTService(RTRepository roomTypeRepository)
        {
            _roomTypeRepository = roomTypeRepository;
        }

        public async Task<IEnumerable<RoomTypeDTO>> GetAllRoomTypesAsync()
        {
            var roomTypes = await _roomTypeRepository.GetAllRoomTypesAsync();
            return roomTypes.Select(rt => new RoomTypeDTO
            {
                RoomTypeID = rt.RoomTypeId,
                TypeName = rt.TypeName
            });
        }

        public async Task<RoomTypeDTO> GetRoomTypeByIdAsync(int id)
        {
            var roomType = await _roomTypeRepository.GetRoomTypeByIdAsync(id);
            if (roomType == null)
                return null;

            return new RoomTypeDTO
            {
                RoomTypeID = roomType.RoomTypeId,
                TypeName = roomType.TypeName
            };
        }

        public async Task<RoomTypeDTO> CreateRoomTypeAsync(RoomTypeDTO roomTypeDto)
        {
            var roomType = new RoomType
            {
                TypeName = roomTypeDto.TypeName
            };

            var created = await _roomTypeRepository.CreateRoomTypeAsync(roomType);

            return new RoomTypeDTO
            {
                RoomTypeID = created.RoomTypeId,
                TypeName = created.TypeName
            };
        }
    }
}