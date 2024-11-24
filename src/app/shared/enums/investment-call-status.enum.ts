export enum InvestmentCallStatus {
  OPEN = 1,
  CLOSE = 2,
}

export const InvestmentCallLabel: Record<InvestmentCallStatus, string> = {
  [InvestmentCallStatus.OPEN]: 'Đang diễn ra',
  [InvestmentCallStatus.CLOSE]: 'Đã đóng',
}
