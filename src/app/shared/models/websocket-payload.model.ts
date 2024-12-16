import { Task } from 'src/app/shared/models/task/task.model'
import { TaskDetails } from './task/task-details.model'
import { Milestone } from './milestone/milestone.model'
import { MilestoneDetails } from './milestone/milestone-details.model'

export type WebsocketPayload = {
  data: Task | TaskDetails | Milestone | MilestoneDetails
  action: 'create' | 'update' | 'delete'
}
