export const UserRole = {
  LECTURER: 'Giảng viên',
  STUDENT: 'Sinh viên',
  GUEST: 'GUEST'
};

/**
 * Trạng thái đặt phòng (Tách ra từ Interface Booking để dễ dùng lại)
 */
export const BookingStatus = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed'
};

/**
 * Mức độ nghiêm trọng của sự cố (Tách ra từ Interface IssueReport)
 */
export const IssueSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
};

/**
 * Trạng thái xử lý sự cố
 */
export const IssueStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved'
};