import { DisbursementStatus } from "../../enums/disbursement-status.enum";

export type DisbursementModel = {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  condition: string;
  disbursementStatus: DisbursementStatus;
}
