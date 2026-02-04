import React, { useState, useEffect } from "react"
import { Search, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
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
    const [currentPage, setCurrentPage] = useState(1)
    const roomsPerPage = 8

    // Reset to page 1 when search query or filtered rooms change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filteredRooms.length])

    // Calculate pagination
    const totalPages = Math.ceil(filteredRooms.length / roomsPerPage)
    const startIndex = (currentPage - 1) * roomsPerPage
    const endIndex = startIndex + roomsPerPage
    const currentRooms = filteredRooms.slice(startIndex, endIndex)

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = []
        const maxPagesToShow = 5

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                pages.push(currentPage - 1)
                pages.push(currentPage)
                pages.push(currentPage + 1)
                pages.push("...")
                pages.push(totalPages)
            }
        }
        return pages
    }

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1))
    }

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages))
    }

    const handlePageClick = (page) => {
        if (typeof page === 'number') {
            setCurrentPage(page)
        }
    }

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

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentRooms.map(room => (
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

            {/* Pagination */}
            {filteredRooms.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pb-4">
                    {/* Total pages info */}
                    <div className="text-sm text-gray-600">
                        Trang {currentPage} / {totalPages} (Tổng {filteredRooms.length} phòng)
                    </div>

                    {/* Pagination controls */}
                    <div className="flex items-center gap-2">
                        {/* Previous button */}
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${currentPage === 1
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page numbers */}
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePageClick(page)}
                                    disabled={page === "..."}
                                    className={`min-w-[40px] h-[40px] rounded-lg border ${page === currentPage
                                            ? "bg-[#facb01] border-[#facb01] text-black font-semibold"
                                            : page === "..."
                                                ? "border-transparent text-gray-400 cursor-default"
                                                : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        {/* Next button */}
                        <button
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${currentPage === totalPages
                                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
