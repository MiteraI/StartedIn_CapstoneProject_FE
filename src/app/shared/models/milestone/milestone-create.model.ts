import { MeetingCreateModel } from "../meeting/meeting-create.model"

export type CreateMilestone = {
  title: string
  description: string
  startDate: string
  endDate: string
  phaseId: string
  meetingList: MeetingCreateModel[]
}
