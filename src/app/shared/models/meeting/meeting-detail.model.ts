import { ContractType } from '../../enums/contract-type.enum'
import { MeetingStatus } from '../../enums/meeting-status.enum'
import { MeetingNoteDetail } from './meeting-note/meeting-note-detail.model'

export type MeetingDetailModel = {
  id: string
  projectId: string
  milestoneId: string
  milestoneName: string
  title: string
  appointmentTime: string
  appointmentEndTime: string
  description: string
  meetingLink: string
  status: MeetingStatus
  contractId?: string
  contractName?: string
  contractType?: ContractType
  meetingNotes: MeetingNoteDetail[]
}
