import { ContractStatus } from "../../enums/contract-status.enum";
import { DisbursementModel } from "../disbursement/disbursement.model";
import { MeetingDetailModel } from "../meeting/meeting-detail.model";

export type InvestmentContractDetailModel = {
  id: string;
  dealOfferId: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  investorId: string;
  investorName: string;
  investorEmail: string;
  investorPhoneNumber: string;
  buyPrice: number;
  sharePercentage: number;
  projectName: string;
  liquidationNoteId?: string;
  disbursements: DisbursementModel[];
  appointments: MeetingDetailModel[];
}
