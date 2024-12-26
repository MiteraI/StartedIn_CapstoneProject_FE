export enum InvestmentCallStatus {
  OPEN = 1,
  CLOSED = 2,
  PENDING = 3,
  CANCELLED = 4
}

export const InvestmentCallLabel: Record<InvestmentCallStatus, string> = {
  [InvestmentCallStatus.OPEN]: 'Đang diễn ra',
  [InvestmentCallStatus.CLOSED]: 'Đã đóng',
  [InvestmentCallStatus.PENDING]: 'Đang chờ duyệt',
  [InvestmentCallStatus.CANCELLED]: 'Đã từ chối',
}
