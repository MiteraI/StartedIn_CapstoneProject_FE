import { TaskStatus } from '../../enums/task-status.enum'
import { Milestone } from '../project-charter/project-charter.model'
import { TeamMemberModel } from '../user/team-member.model'
import { Task } from './task.model'

export type TaskDetails = {
  title: string
  description: string
  deadline: string
  status: TaskStatus
  isLate: boolean
  parentTask: Task
  milestone: Milestone
  assignees: TeamMemberModel[]
  subTasks: Task[]
}
