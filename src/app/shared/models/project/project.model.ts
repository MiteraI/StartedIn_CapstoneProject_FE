import { ProjectStatus } from '../../enums/project-status.enum'
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
}
