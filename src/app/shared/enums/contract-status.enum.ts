export enum ContractStatus {
  DRAFT = 0,
  SENT = 1,
  COMPLETED = 2,
  DECLINED = 3,
  EXPIRED = 4
}

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Bản nháp',
  [ContractStatus.SENT]: 'Đã gửi',
  [ContractStatus.COMPLETED]: 'Đã ký kết',
  [ContractStatus.DECLINED]: 'Bị từ chối',
  [ContractStatus.EXPIRED]: 'Hết hạn'
};
