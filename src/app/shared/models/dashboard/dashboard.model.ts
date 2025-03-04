import { MilestoneProgressModel } from "../milestone/milestone-progress.model";
import { Task } from "../task/task.model";

export type DashboardModel = {
  currentBudget: number;
  inAmount: number; // tiền thu trong tháng
  outAmount: number; // tiền chi trong tháng
  remainingDisbursement: number;
  disbursedAmount: number;
  // % cổ phần của login user
  shareEquityPercentage: number;
  // progress của các milestone
  milestoneProgress: MilestoneProgressModel[];
  // nếu login user là investor
  selfRemainingDisbursement: number;
  selfDisbursedAmount: number;
  totalTask: number;
  completedTasks: Task[];
  overdueTasks: Task[];
}
