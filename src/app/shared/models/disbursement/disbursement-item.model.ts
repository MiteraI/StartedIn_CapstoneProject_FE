import { DisbursementStatus } from "../../enums/disbursement-status.enum";

export type DisbursementItemModel = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  amount: number;
  disbursementStatus: DisbursementStatus;
  investorName: string;
  investorProfilePicture: string;
  projectName: string;
  projectLogoUrl: string;
  contractIdNumber: string;
}
