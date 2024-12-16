export enum ContractType {
  INTERNAL = 1,
  INVESTMENT = 2,
  LIQUIDATIONNOTE = 3
}

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.INVESTMENT]: 'Hợp đồng đầu tư',
  [ContractType.INTERNAL]: 'Hợp đồng nội bộ',
  [ContractType.LIQUIDATIONNOTE]: 'Biên bản thanh lý'
};
