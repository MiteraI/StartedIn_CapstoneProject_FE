export enum TransactionType {
  DISBURSEMENT = 1,
  ASSET_EXPENSE = 2,
  ASSET_LIQUIDATION = 3,
  OTHER = 4
}

export const TransactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.DISBURSEMENT]: 'Giải ngân',
  [TransactionType.ASSET_EXPENSE]: 'Mua tài sản',
  [TransactionType.ASSET_LIQUIDATION]: 'Thanh lý tài sản',
  [TransactionType.OTHER]: 'Giao dịch khác',
}
