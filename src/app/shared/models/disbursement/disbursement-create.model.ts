export interface DisbursementCreateModel {
  title: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  condition: string;
}