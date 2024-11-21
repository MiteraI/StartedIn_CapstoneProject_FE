import { PhaseState } from "../../enums/phase-status.enum"
import { Task } from "../task/task.model"

export type MilestoneDetails = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  progress: number
  phaseName: PhaseState
  charterId: string
  assignedTasks: Task[]
}