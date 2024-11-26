import { DisbursementMonthlyInfoModel } from "./disbursement-monthly-info.model";

export type DisbursementForProjectModel = {
  id: string;
  projectName: string;
  logoUrl: string;
  disbursementInfo: DisbursementMonthlyInfoModel[];
}
