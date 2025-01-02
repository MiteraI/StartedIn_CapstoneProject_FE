import { DisbursementMonthlyInfoModel } from "./disbursement-monthly-info.model";

export type DisbursementOverallModel = {
  overall: DisbursementMonthlyInfoModel;
  lastMonth: DisbursementMonthlyInfoModel;
  currentMonth: DisbursementMonthlyInfoModel;
  nextMonth: DisbursementMonthlyInfoModel;
}
