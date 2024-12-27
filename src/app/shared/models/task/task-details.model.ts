import { TaskStatus } from '../../enums/task-status.enum'
import { Milestone } from '../milestone/milestone.model'
import { TaskAttachment } from '../task-attachment/task-attachment.model'
import { TaskComment } from '../task-comment/task-comment.model'
import { TeamMemberModel } from '../user/team-member.model'
import { Task } from './task.model'
import { UserTask } from './user-task.model'

export type TaskDetails = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: TaskStatus
  isLate: boolean
  expectedManHour: number
  actualManHour: number
  parentTask: Task
  milestone: Milestone
  assignees: TeamMemberModel[]
  subTasks: Task[]
  taskComments: TaskComment[]
  taskAttachments: TaskAttachment[]
  userTasks: UserTask[]
}
