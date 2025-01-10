export enum DisbursementStatus {
  PENDING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  FINISHED = 4,
  OVERDUE = 5,
  ERROR = 6,
  CANCELLED = 7,
  NOTVALID = 8,
}

export const DisbursementStatusLabels: Record<DisbursementStatus, string> = {
  [DisbursementStatus.PENDING]: 'Đang chờ',
  [DisbursementStatus.ACCEPTED]: 'Đã ghi nhận',
  [DisbursementStatus.REJECTED]: 'Bị từ chối',
  [DisbursementStatus.FINISHED]: 'Đã hoàn tất',
  [DisbursementStatus.OVERDUE]: 'Quá hạn',
  [DisbursementStatus.ERROR]: 'Lỗi',
  [DisbursementStatus.CANCELLED]: 'Đã huỷ',
  [DisbursementStatus.NOTVALID]: 'Không hợp lệ',
};
