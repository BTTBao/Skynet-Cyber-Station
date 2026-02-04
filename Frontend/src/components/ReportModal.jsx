import React, { useState } from "react"
import { AlertTriangle, Sparkles, Send, Loader2 } from "lucide-react"

export const ReportModal = ({ isOpen, onClose, room, onSubmit }) => {
    const [description, setDescription] = useState("")

    if (!isOpen || !room) return null

    const handleSubmit = () => {
        if (description) {
            onSubmit(room.id, description)
            setDescription("")
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <AlertTriangle className="mr-2 text-[#facb01]" />
                        <h2 className="text-xl font-bold text-[#271756]">Báo cáo sự cố</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        Đóng
                    </button>
                </div>

                <p className="mb-4 text-gray-600 text-sm">
                    Đang báo cáo cho phòng:{" "}
                    <span className="font-semibold text-gray-900">{room.name}</span>
                </p>

                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết vấn đề (ví dụ: Máy số 5 bị màn hình xanh, máy chiếu không lên nguồn...)"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#facb01] min-h-[120px] outline-none mb-4"
                />

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-2 bg-[#facb01] text-[#271756] rounded-lg hover:bg-[#facb01]/80 flex items-center justify-center font-bold shadow-lg shadow-[#facb01]/30 transition-colors"
                    >
                        <Send size={18} className="mr-2" /> Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    )
}
