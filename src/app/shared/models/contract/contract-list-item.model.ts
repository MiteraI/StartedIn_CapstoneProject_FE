import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractType } from "../../enums/contract-type.enum";
import { DisbursementContractList } from "../disbursement/disbursement-contractlist.model";
import { ContractPartyModel } from "./contract-party.model";

export type ContractListItemModel = {
  id: string;
  contractName: string;
  contractIdNumber: string;
  contractType: ContractType;
  parties: ContractPartyModel[];
  lastUpdatedTime: string;
  contractStatus: ContractStatus;
  totalDisbursementAmount: number;
  disbursedAmount: number;
  pendingAmount:number;
  disbursements: DisbursementContractList[];
  expand: boolean;
}
