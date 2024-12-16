import { MilestoneDetails } from 'src/app/shared/models/milestone/milestone-details.model'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { TaskDetails } from 'src/app/shared/models/task/task-details.model'
import { Task } from 'src/app/shared/models/task/task.model'

//if pagination is on final page and array length is not equal to size, then call this
//if not then do nothing
//if on mobile, then simply call this
export function createData(array: Task[] | TaskDetails[] | Milestone[] | MilestoneDetails[], data: Task | TaskDetails | Milestone | MilestoneDetails) {
  return [...array, data]
}

//ìf there is no matching item on current array, then do nothing
export function updateData(array: Task[] | TaskDetails[] | Milestone[] | MilestoneDetails[], data: Task | TaskDetails | Milestone | MilestoneDetails) {
  return array.map((item: Task | TaskDetails | Milestone | MilestoneDetails) => (item.id === data.id ? data : item))
}

//if pagination is on final page, and item exist on current array, then call this
//if not then refresh array
//if on mobile, then simply call this
export function deleteData(array: Task[] | TaskDetails[] | Milestone[] | MilestoneDetails[], id: string) {
  return array.filter((item: Task | TaskDetails | Milestone | MilestoneDetails) => item.id !== id)
}