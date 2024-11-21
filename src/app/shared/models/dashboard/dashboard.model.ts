import { MilestoneProgressModel } from "../milestone/milestone-progress.model";

export type DashboardModel = {
  currentBudget: number;
  inAmount: number; // tiền vào trong tháng trước
  outAmount: number; // tiền ra trong tháng trước
  remainingDisbursement: number;
  disbursedAmount: number;
  // % cổ phần của login user
  shareEquityPercentage: number;
  // progress của các milestone
  milestoneProgress: MilestoneProgressModel[];
  // nếu login user là investor
  selfRemainingDisbursement: number;
  selfDisbursedAmount: number;
}
