import { TaskStatus } from '../../enums/task-status.enum'
import { Milestone } from '../milestone/milestone.model'
import { TeamMemberModel } from '../user/team-member.model'
import { Task } from './task.model'

export type TaskDetails = {
  title: string
  description: string
  startDate: string
  endDate: string
  status: TaskStatus
  isLate: boolean
  manHour: number
  parentTask: Task
  milestone: Milestone
  assignees: TeamMemberModel[]
  subTasks: Task[]
}
