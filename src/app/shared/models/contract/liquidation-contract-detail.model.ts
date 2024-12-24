import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractType } from "../../enums/contract-type.enum";
import { UserPartyInContractModel } from "./user-party-in-contract.model";

export type LiquidationContractDetailModel = {
  id: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  parentContractId: string;
  parentContractType: ContractType;
  projectName?: string;
  parties?: UserPartyInContractModel[];
}
