import { TaskStatus } from "../../enums/task-status.enum"

export type Task = {
  id: string
  title: string
  description: string
  deadline: string
  status: TaskStatus
  isLate: boolean
  createdBy: string
  createdAt: string
}
