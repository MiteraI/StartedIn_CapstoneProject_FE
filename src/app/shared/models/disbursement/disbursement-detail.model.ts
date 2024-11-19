import { DisbursementStatus } from "../../enums/disbursement-status.enum";
import { DisbursementAttachment } from "./disbursement-attachment.model";

export type DisbursementDetailModel = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  amount: number;
  condition: string;
  disbursementStatus: DisbursementStatus;
  projectId: string;
  projectName: string;
  logoUrl: string;
  investorId: string;
  investorName: string;
  contractId: string;
  contractIdNumber: string;
  declineReason: string;
  disbursementAttachments: DisbursementAttachment[];
}
