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
                            {(() => {
                                // Format giờ bắt đầu
                                const startTimeStr = `${startHour.toString().padStart(2, '0')}:00`;

                                // Tính giờ kết thúc
                                const endTimeDecimal = startHour + duration;
                                const endHour = Math.floor(endTimeDecimal);
                                const endMinute = Math.round((endTimeDecimal - endHour) * 60);
                                const endTimeStr = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

                                // Format duration
                                const durationHours = Math.floor(duration);
                                const durationMinutes = Math.round((duration - durationHours) * 60);
                                let durationStr = '';
                                if (durationHours > 0 && durationMinutes > 0) {
                                    durationStr = `${durationHours}h ${durationMinutes}p`;
                                } else if (durationHours > 0) {
                                    durationStr = `${durationHours}h`;
                                } else {
                                    durationStr = `${durationMinutes}p`;
                                }

                                return `${startTimeStr} - ${endTimeStr} (${durationStr})`;
                            })()}
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
