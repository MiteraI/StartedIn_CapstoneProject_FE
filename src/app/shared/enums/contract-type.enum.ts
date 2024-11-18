export enum ContractType {
  INTERNAL = 1,
  INVESTMENT = 2
}

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.INVESTMENT]: 'Đầu tư',
  [ContractType.INTERNAL]: 'Nội bộ'
};
