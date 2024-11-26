import { TaskStatus } from "../../enums/task-status.enum"

export type Task = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: TaskStatus
  isLate: boolean
  createdBy: string
  createdTime: string
}
