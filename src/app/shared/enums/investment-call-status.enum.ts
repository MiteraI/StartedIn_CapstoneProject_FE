export enum InvestmentCallStatus {
  OPEN = 1,
  CLOSED = 2,
}

export const InvestmentCallLabel: Record<InvestmentCallStatus, string> = {
  [InvestmentCallStatus.OPEN]: 'Đang diễn ra',
  [InvestmentCallStatus.CLOSED]: 'Đã đóng',
}
