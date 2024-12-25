import { MeetingStatus } from '../enums/meeting-status.enum'

export interface MeetingFilterOptions {
  milestoneId?: string
  title?: string
  fromDate?: Date
  toDate?: Date
  meetingStatus?: MeetingStatus
  isDescending?: boolean
}
