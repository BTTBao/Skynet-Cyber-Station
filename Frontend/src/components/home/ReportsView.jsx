import React from "react"
import { CheckCircle2, Sparkles } from "lucide-react"
import { MOCK_ROOMS } from "../../data/constants"

export const ReportsView = ({ reports }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-[#271756]/5 border border-[#271756]/10 p-4 rounded-xl flex gap-3">
                <Sparkles className="text-[#facb01] flex-shrink-0" />
                <p className="text-sm text-[#271756]">
                    Hệ thống sử dụng AI để tự động phân tích mức độ nghiêm trọng
                    của sự cố bạn báo cáo, giúp bộ phận kỹ thuật ưu tiên xử lý
                    nhanh chóng.
                </p>
            </div>

            {reports.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                    <CheckCircle2
                        size={48}
                        className="mx-auto text-green-500 mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900">
                        Không có sự cố nào
                    </h3>
                    <p className="text-gray-500">Mọi thứ đang hoạt động tốt!</p>
                </div>
            ) : (
                reports.map(report => {
                    const room = MOCK_ROOMS.find(r => r.id === report.roomId)
                    return (
                        <div
                            key={report.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg flex items-center">
                                        {room?.name}
                                        <span
                                            className={`ml-3 px-2 py-0.5 rounded text-xs uppercase ${report.severity === "HIGH"
                                                    ? "bg-red-100 text-red-700"
                                                    : report.severity === "MEDIUM"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-blue-100 text-blue-700"
                                                }`}
                                        >
                                            {report.severity === "HIGH"
                                                ? "Nghiêm trọng"
                                                : report.severity === "MEDIUM"
                                                    ? "Trung bình"
                                                    : "Thấp"}
                                        </span>
                                    </h3>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(report.timestamp).toLocaleString()}
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                    {report.status === "OPEN"
                                        ? "Đang chờ xử lý"
                                        : "Đã tiếp nhận"}
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-xs font-semibold text-gray-500 uppercase">
                                        Mô tả của bạn:
                                    </span>
                                    <p className="text-gray-800 mt-1">
                                        {report.description}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="text-xs font-semibold text-[#271756] uppercase flex items-center mb-1">
                                        <Sparkles
                                            size={12}
                                            className="mr-1 text-[#facb01]"
                                        />{" "}
                                        Phân tích AI:
                                    </span>
                                    <p className="text-sm text-gray-700">
                                        {report.aiAnalysis}
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
