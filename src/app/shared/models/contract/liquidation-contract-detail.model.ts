import { ContractStatus } from "../../enums/contract-status.enum";
import { UserPartyInContractModel } from "./user-party-in-contract.model";

export type LiquidationContractDetailModel = {
  id: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  projectName?: string;
  parties?: UserPartyInContractModel[];
}