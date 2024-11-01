export enum ContractType {
  INVESTMENT = 0,
  INTERNAL = 1
}

export const ContractTypeLabels: Record<ContractType, string> = {
  [ContractType.INVESTMENT]: 'Đầu tư',
  [ContractType.INTERNAL]: 'Nội bộ'
};
