export enum TransactionType {
  DISBURSEMENT = 1,
  ASSET_EXPENSE = 2,
  OTHER = 3,
  ASSET_LIQUIDATION = 4
}

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.DISBURSEMENT]: 'Giải ngân',
  [TransactionType.ASSET_EXPENSE]: 'Mua tài sản',
  [TransactionType.OTHER]: 'Giao dịch khác',
  [TransactionType.ASSET_LIQUIDATION]: 'Thanh lý tài sản',
}
