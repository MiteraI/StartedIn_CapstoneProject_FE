import { DisbursementStatus } from "../../enums/disbursement-status.enum";

export type ProjectDisbursementItemModel = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  amount: number;
  disbursementStatus: DisbursementStatus;
  investorName: string
  contractIdNumber: string
}
