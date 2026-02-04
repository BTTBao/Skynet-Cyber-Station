import React from 'react'
import { format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const CalendarHeader = ({
    currentDate,
    viewMode,
    setViewMode,
    selectedRoomId,
    setSelectedRoomId,
    rooms,
    onPrev,
    onNext,
    onToday
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button onClick={onPrev} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-[#271756]">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={onToday} className="px-3 py-2 text-sm font-medium hover:bg-white hover:shadow-sm rounded-md transition-all text-[#271756]">
                        Hôm nay
                    </button>
                    <button onClick={onNext} className="p-2 hover:bg-white hover:shadow-sm rounded-md transition-all text-[#271756]">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <h2 className="text-xl font-bold text-[#271756] capitalize min-w-[200px] text-center">
                    {format(currentDate, "MM/yyyy")}
                </h2>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <select
                    className="p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#facb01] outline-none bg-white flex-1 md:flex-none"
                    value={selectedRoomId}
                    onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                    <option value="all">Tất cả phòng</option>
                    {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>

                <div className="flex bg-gray-100 rounded-lg p-1 flex-shrink-0">
                    {['month', 'week', 'day'].map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${viewMode === mode
                                ? 'bg-[#271756] text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {mode === 'month' ? 'Tháng' : mode === 'week' ? 'Tuần' : 'Ngày'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Legend - Ghi chú màu sắc */}
            <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-[#271756] border-l-2 border-[#facb01] rounded-sm"></div>
                    <span className="text-gray-600">Đã xác nhận</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-orange-400 border-l-2 border-orange-600 rounded-sm"></div>
                    <span className="text-gray-600">Chờ duyệt</span>
                </div>
            </div>
        </div>
    )
}
