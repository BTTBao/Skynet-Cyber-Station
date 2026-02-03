import React from "react"
import { UserRole } from "../data/type"
import { Cpu, HardDrive, Users, CheckCircle } from "lucide-react"

export const RoomCard = ({
    room,
    onViewDetails,
    onBook,
    userRole,
    isRecommended
}) => {
    const getPriceDisplay = () => {
        if (userRole === UserRole.LECTURER) {
            return (
                <span className="text-green-600 font-bold">Miễn phí (Giảng viên)</span>
            )
        }
        return (
            <span className="text-[#271756] font-bold">
                {room.pricePerHour.toLocaleString()} VNĐ/giờ
            </span>
        )
    }

    return (
        <div
            className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all border ${isRecommended
                ? "border-[#facb01] ring-2 ring-[#facb01]/20"
                : "border-gray-200"
                } overflow-hidden flex flex-col`}
        >
            <div className="relative h-48">
                <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                />
                {isRecommended && (
                    <div className="absolute top-2 right-2 bg-[#facb01] text-[#271756] text-xs px-2 py-1 rounded-full flex items-center shadow-lg font-bold">
                        <CheckCircle size={12} className="mr-1" /> Gợi ý bởi AI
                    </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {room.machineCount} máy
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{room.name}</h3>

                <div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
                    <div className="flex items-center">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span>Sức chứa: {room.capacity} người</span>
                    </div>
                    <div className="flex items-center">
                        <Cpu size={16} className="mr-2 text-gray-400" />
                        <span className="truncate" title={room.specs.cpu}>
                            {room.specs.cpu}
                        </span>
                    </div>
                    <div className="flex items-center">
                        <HardDrive size={16} className="mr-2 text-gray-400" />
                        <span>
                            {room.specs.ram} • {room.specs.gpu}
                        </span>
                    </div>
                </div>

                <div className="mt-auto border-t pt-3 flex justify-between items-center">
                    <div className="text-sm">{getPriceDisplay()}</div>
                </div>

                <div className="mt-3 flex gap-2">
                    <button
                        onClick={() => onViewDetails(room)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Chi tiết
                    </button>
                    <button
                        onClick={() => onBook(room)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-white bg-[#271756] rounded-lg hover:bg-[#271756]/90 transition-colors"
                    >
                        {userRole === UserRole.LECTURER ? "Mượn phòng" : "Thuê ngay"}
                    </button>
                </div>
            </div>
        </div>
    )
}
