export enum DealStatus {
  WAITING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
  CONTRACTCREATED = 4
}

export const DealStatusLabels: Record<DealStatus, string> = {
  [DealStatus.WAITING]: 'Đang chờ',
  [DealStatus.ACCEPTED]: 'Đã chấp nhận',
  [DealStatus.REJECTED]: 'Đã từ chối',
  [DealStatus.CONTRACTCREATED]: 'Đã tạo hợp đồng'
};
