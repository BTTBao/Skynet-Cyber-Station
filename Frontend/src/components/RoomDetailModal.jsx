import React from "react"
import { UserRole } from "../data/type"
import {
    X,
    LayoutGrid,
    Monitor,
    CheckCircle,
    Box,
    ArrowRight,
    AlertTriangle
} from "lucide-react"

export const RoomDetailModal = ({
    isOpen,
    onClose,
    room,
    onProceedToBook,
    userRole
}) => {
    if (!isOpen) return null

    const software = ["Office 365", "VS Code", "NodeJS", "Python", "Docker", "Adobe Photoshop", "Illustrator"]
    console.log(room);

    // Xử lý specs: Nếu cpu chứa dấu phẩy => tách thành các phần riêng
    const processedSpecs = (() => {
        const { cpu, ram, gpu, storage } = room.specs || {};

        // Nếu cpu chứa dấu phẩy, parse lại toàn bộ
        if (cpu && cpu.includes(',')) {
            const parts = cpu.split(',').map(p => p.trim());
            return {
                cpu: parts[0] || "Đang cập nhật",
                ram: parts[1] || ram || "Đang cập nhật",
                storage: parts[2] || storage || "Đang cập nhật",
                gpu: parts[3] || gpu || "Đang cập nhật"
            };
        }

        // Nếu không có dấu phẩy, dùng như cũ
        return {
            cpu: cpu || "Đang cập nhật",
            ram: ram || "Đang cập nhật",
            gpu: gpu || "Đang cập nhật",
            storage: storage || "Đang cập nhật"
        };
    })();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row">
                {/* Left Side: Image & Key Stats */}
                <div className="md:w-2/5 bg-gray-50 flex flex-col">
                    <div className="h-64 md:h-full relative">
                        <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-[#271756] shadow-sm">
                            {room.machineCount} máy trạm
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 md:hidden"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Right Side: Details */}
                <div className="md:w-3/5 p-6 md:p-8 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-[#271756] mb-1">
                                {room.name}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                Sức chứa tối đa: {room.capacity} người
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="hidden md:block text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Specs Section */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                <Monitor className="mr-2 text-[#facb01]" size={18} /> Cấu hình
                                máy trạm
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-[#271756]/5 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 block">CPU</span>
                                    <span className="font-semibold text-[#271756] text-sm">
                                        {processedSpecs.cpu}
                                    </span>
                                </div>
                                <div className="bg-[#271756]/5 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 block">RAM</span>
                                    <span className="font-semibold text-[#271756] text-sm">
                                        {processedSpecs.ram}
                                    </span>
                                </div>
                                <div className="bg-[#271756]/5 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Lưu trữ</span>
                                    <span className="font-semibold text-[#271756] text-sm">
                                        {processedSpecs.storage}
                                    </span>
                                </div>
                                <div className="bg-[#271756]/5 p-3 rounded-lg">
                                    <span className="text-xs text-gray-500 block">Màn hình</span>
                                    <span className="font-semibold text-[#271756] text-sm">
                                        {processedSpecs.gpu}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Software Section */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                <Box className="mr-2 text-[#facb01]" size={18} /> Phần mềm cài
                                đặt sẵn
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {software.map((sw, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-700 shadow-sm"
                                    >
                                        {sw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Features Section */}
                        <div>
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                <LayoutGrid className="mr-2 text-[#facb01]" size={18} /> Tiện
                                ích phòng
                            </h3>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {room.features.map((ft, idx) => (
                                    <li
                                        key={idx}
                                        className="flex items-center text-sm text-gray-600"
                                    >
                                        <CheckCircle size={14} className="mr-2 text-green-500" />{" "}
                                        {ft}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Incident Reports Section */}
                        {room.activeIncidentReports?.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                                    <AlertTriangle className="mr-2 text-orange-500" size={18} /> Sự cố
                                </h3>
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <ul className="space-y-2">
                                        {room.activeIncidentReports.map((report, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-start text-sm text-orange-800"
                                            >
                                                <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0 text-orange-500" />
                                                <span>{report}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Action */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Đơn giá</span>
                            {userRole === UserRole.LECTURER ? (
                                <span className="text-green-600 font-bold text-lg">
                                    Miễn phí
                                </span>
                            ) : (
                                <span className="text-[#271756] font-bold text-xl">
                                    {room.pricePerHour.toLocaleString()} VNĐ
                                    <span className="text-sm text-gray-400 font-normal">
                                        /giờ
                                    </span>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => onProceedToBook(room)}
                            className="px-6 py-3 bg-[#271756] text-white rounded-xl font-bold shadow-lg shadow-[#271756]/20 hover:bg-[#271756]/90 transition-all flex items-center group"
                        >
                            Chọn khung giờ{" "}
                            <ArrowRight
                                size={18}
                                className="ml-2 group-hover:translate-x-1 transition-transform"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
