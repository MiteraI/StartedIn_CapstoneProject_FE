import { TaskStatus } from "../../enums/task-status.enum"
import { TeamMemberModel } from "../user/team-member.model"
import { AssigneeInTask } from "./assignee-in-task.model"

export type Task = {
  id: string,
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  status: TaskStatus,
  isLate: boolean,
  createdBy: string,
  createdTime: string,
  manHour: number,
  actualFinishAt: string,
  actualManHour: number,
  assignees: AssigneeInTask[],
  expand: boolean,
}
