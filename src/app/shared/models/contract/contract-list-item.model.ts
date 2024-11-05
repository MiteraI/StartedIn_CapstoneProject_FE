import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractType } from "../../enums/contract-type.enum";
import { ContractPartyModel } from "./contract-party.model";

export type ContractListItemModel = {
  id: string;
  contractName: string;
  contractType: ContractType;
  parties: ContractPartyModel[];
  lastUpdatedTime: string;
  contractStatus: ContractStatus;
}
