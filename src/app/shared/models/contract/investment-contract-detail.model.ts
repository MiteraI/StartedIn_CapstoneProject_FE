import { ContractStatus } from "../../enums/contract-status.enum";
import { DisbursementModel } from "../disbursement/disbursement.model";

export type InvestmentContractDetailModel = {
  id: string;
  dealOfferId: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  investorId: string;
  buyPrice: number;
  sharePercentage: number;
  disbursements: DisbursementModel[];
}
