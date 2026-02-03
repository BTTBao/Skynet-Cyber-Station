import React from "react"
import { Info, CreditCard } from "lucide-react"
import { UserRole } from "../../data/type"

export const BookingSummary = ({
    currentUser,
    startHour,
    duration,
    calculateTotal
}) => {
    return (
        <div className="bg-gray-50 p-4 rounded-xl flex items-start space-x-3">
            <Info className="text-[#271756] mt-1 flex-shrink-0" size={20} />
            <div className="flex-1">
                <p className="text-sm text-gray-600">
                    {currentUser.role === UserRole.LECTURER
                        ? "Giảng viên được ưu tiên mượn phòng miễn phí phục vụ công tác giảng dạy và nghiên cứu."
                        : "Sinh viên và khách ngoài sẽ thanh toán phí thuê theo giờ."}
                </p>
                {startHour && (
                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">
                            {startHour}:00 - {startHour + duration}:00 ({duration}h)
                        </span>
                        <div className="flex items-center text-lg font-bold text-[#271756]">
                            <CreditCard size={20} className="mr-2" />
                            {calculateTotal().toLocaleString()} VNĐ
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
