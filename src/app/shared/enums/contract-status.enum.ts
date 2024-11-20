export enum ContractStatus {
  DRAFT = 1,
  SENT = 2,
  COMPLETED = 3,
  DECLINED = 4,
  EXPIRED = 5
}

export const ContractStatusLabels: Record<ContractStatus, string> = {
  [ContractStatus.DRAFT]: 'Bản nháp',
  [ContractStatus.SENT]: 'Đã gửi',
  [ContractStatus.COMPLETED]: 'Đã ký kết',
  [ContractStatus.DECLINED]: 'Bị từ chối',
  [ContractStatus.EXPIRED]: 'Hết hạn'
};
