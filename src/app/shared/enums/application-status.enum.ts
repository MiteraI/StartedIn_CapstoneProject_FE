export enum ApplicationStatus {
  PENDING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  CANCELLED = 4,
}

export const ApplicationStatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Đang Chờ',
  [ApplicationStatus.ACCEPTED]: 'Đã Chấp Nhận',
  [ApplicationStatus.REJECTED]: 'Đã Từ Chối',
  [ApplicationStatus.CANCELLED]: 'Đã Hủy',
}

export const ApplicationStatusColors: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'blue',
  [ApplicationStatus.ACCEPTED]: 'green',
  [ApplicationStatus.REJECTED]: 'red',
  [ApplicationStatus.CANCELLED]: 'gray',
}