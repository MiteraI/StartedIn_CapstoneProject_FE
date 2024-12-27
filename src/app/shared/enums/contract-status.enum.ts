export enum ContractStatus {
  DRAFT = 1,
  SENT = 2,
  COMPLETED = 3,
  DECLINED = 4,
  EXPIRED = 5,
  WAITING_FOR_LIQUIDATION = 6,
}

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Bản nháp',
  [ContractStatus.SENT]: 'Đã gửi',
  [ContractStatus.COMPLETED]: 'Đã ký kết',
  [ContractStatus.DECLINED]: 'Đã huỷ ký',
  [ContractStatus.EXPIRED]: 'Hết hiệu lực',
  [ContractStatus.WAITING_FOR_LIQUIDATION]: 'Chờ thanh lý'
};
