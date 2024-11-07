import { TaskStatus } from "../../enums/task-status.enum"

export type TaskDetails = {
  title: string
  description: string
  deadline: string
  status: TaskStatus
  isLate: boolean
}
