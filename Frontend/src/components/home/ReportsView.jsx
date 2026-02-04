import React from "react"
import { CheckCircle2, FileText } from "lucide-react"

export const ReportsView = ({ reports, rooms = [] }) => {
    const getStatusDisplay = (status) => {
        switch (status) {
            case "processing":
                return {
                    className: "bg-blue-100 text-blue-700",
                    label: "Đang xử lý"
                };
            case "resolved":
                return {
                    className: "bg-green-100 text-green-700",
                    label: "Đã giải quyết"
                };
            case "not yet processed":
            default:
                return {
                    className: "bg-yellow-100 text-yellow-700",
                    label: "Đang chờ xử lý"
                };
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {reports.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <CheckCircle2
                        size={48}
                        className="mx-auto text-green-500 mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                        Không có sự cố nào
                    </h3>
                    <p className="text-gray-500">Hệ thống đang hoạt động ổn định!</p>
                </div>
            ) : (
                reports.map(report => {
                    // Nếu backend đã trả về roomName thì dùng luôn, không thì tìm trong mảng rooms
                    const roomName = report.roomName || `Phòng ${report.roomId}`;
                    
                    const statusInfo = getStatusDisplay(report.status);
                    return (
                        <div
                            key={report.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                                        {roomName}
                                    </h3>
                                </div>
                                <span className={`px-3 py-1 text-xs rounded-full font-medium ${statusInfo.className}`}>
                                    {statusInfo.label}
                                </span>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex gap-3">
                                <FileText size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                                        Mô tả sự cố:
                                    </span>
                                    <p className="text-gray-800 text-sm">
                                        {report.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })
            )}
        </div>
    )
}