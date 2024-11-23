import { Phase } from "../phase/phase.model"
import { Task } from "../task/task.model"

export type MilestoneDetails = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  progress: number
  phase: Phase
  charterId: string
  assignedTasks: Task[]
}