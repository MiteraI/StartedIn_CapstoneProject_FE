import { MeetingDetailModel } from '../meeting/meeting-detail.model'
import { MeetingListModel } from '../meeting/meeting-list.model'

export type Milestone = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  progress: number
  phaseName: string
  appointments: MeetingDetailModel[]
}
