export enum ContractType {
  INTERNAL = 1,
  INVESTMENT = 2,
  LIQUIDATIONNOTE = 3
}

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.INVESTMENT]: 'Đầu tư',
  [ContractType.INTERNAL]: 'Nội bộ',
  [ContractType.LIQUIDATIONNOTE]: 'Biên bản thanh lý'
};
