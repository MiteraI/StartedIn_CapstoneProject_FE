import { ProjectStatus } from '../../enums/project-status.enum'
import { UserStatusInProject } from '../../enums/user-in-project-status.enum'
import { ProjectApprovalDetail } from '../project-approval/project-approval-detail.model'
import { ProjectCharter } from '../project-charter/project-charter.model'

export type ProjectModel = {
  id: string
  projectName: string
  description: string
  projectStatus: ProjectStatus
  leaderId: string
  leaderFullName: string
  leaderProfilePicture: string
  logoUrl: string
  remainingPercentOfShares: number
  startDate: string
  endDate?: string
  projectCharterResponseDto?: ProjectCharter
  isSignedInternalContract?: string
  currentMember: number
  userStatusInProject: UserStatusInProject
  appointmentUrl?: string
  projectDetailPost?: string
  pendingApproval?: ProjectApprovalDetail
}
