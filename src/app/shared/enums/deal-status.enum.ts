export enum DealStatus {
  WAITING = 0,
  ACCEPTED = 1,
  REJECTED = 2
}

export const DealStatusLabels: Record<DealStatus, string> = {
  [DealStatus.WAITING]: 'Đang chờ',
  [DealStatus.ACCEPTED]: 'Đã chấp nhận',
  [DealStatus.REJECTED]: 'Đã từ chối'
};
