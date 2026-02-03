import React from "react"
import { Search, Sparkles } from "lucide-react"
import { RoomCard } from "../RoomCard"

export const RoomsView = ({
    searchQuery,
    setSearchQuery,
    recommendedRoomIds,
    setRecommendedRoomIds,
    filteredRooms,
    currentUserRole,
    onViewRoomDetail
}) => {
    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={20}
                    />
                    <input
                        type="text"
                        placeholder="Tìm theo tên phòng, hoặc mô tả nhu cầu (VD: Cần máy chạy mạnh)"
                        value={searchQuery}
                        onChange={e => {
                            setSearchQuery(e.target.value)
                            if (e.target.value === "") setRecommendedRoomIds([])
                        }}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#facb01] outline-none shadow-sm"
                    />
                </div>
            </div>

            {recommendedRoomIds.length > 0 && (
                <div className="flex items-center space-x-2 text-[#271756] bg-[#271756]/5 px-4 py-2 rounded-lg text-sm border border-[#271756]/10">
                    <Sparkles size={16} className="text-[#facb01]" />
                    <span>
                        AI đã lọc ra các phòng phù hợp nhất với yêu cầu của bạn.
                    </span>
                    <button
                        onClick={() => setRecommendedRoomIds([])}
                        className="underline hover:text-[#271756]/80 ml-2 font-medium"
                    >
                        Xóa lọc
                    </button>
                </div>
            )}

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRooms.map(room => (
                    <RoomCard
                        key={room.id}
                        room={room}
                        userRole={currentUserRole}
                        onBook={onViewRoomDetail}
                        onViewDetails={onViewRoomDetail}
                        isRecommended={recommendedRoomIds.includes(room.id)}
                    />
                ))}
            </div>

            {filteredRooms.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    <p>Không tìm thấy phòng nào phù hợp.</p>
                </div>
            )}
        </div>
    )
}
