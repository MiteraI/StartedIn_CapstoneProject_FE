import { ContractType } from "../../enums/contract-type.enum";

export type ValidContractModel = {
  id: string;
  contractName: string;
  contractIdNumber: string;
  contractType: ContractType;
}
