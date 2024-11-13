export enum DisbursementStatus {
  PENDING = 0,
  ACCEPTED = 1,
  REJECTED = 2,
  FINISHED = 3,
  OVERDUE = 4,
  ERROR = 5
}

export const DisbursementStatusLabels: Record<DisbursementStatus, string> = {
  [DisbursementStatus.PENDING]: 'Đang chò',
  [DisbursementStatus.ACCEPTED]: 'Đã chấp nhận',
  [DisbursementStatus.REJECTED]: 'Bị từ chối',
  [DisbursementStatus.FINISHED]: 'Đã hoàn tất',
  [DisbursementStatus.OVERDUE]: 'Quá hạn',
  [DisbursementStatus.ERROR]: 'Lỗi'
};
