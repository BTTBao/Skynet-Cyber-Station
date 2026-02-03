export const UserRole = {
  LECTURER: 'LECTURER',
  STUDENT: 'STUDENT',
  GUEST: 'GUEST'
};

/**
 * Trạng thái đặt phòng (Tách ra từ Interface Booking để dễ dùng lại)
 */
export const BookingStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
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
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED'
};