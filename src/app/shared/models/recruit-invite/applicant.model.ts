import { ApplicationStatus } from '../../enums/application-status.enum'
import { ApplicationType } from '../../enums/application-type.enum'
import { TeamRole } from '../../enums/team-role.enum'
import { FullProfile } from '../user/full-profile.model'
import { ApplicationApplyFile } from './application-apply-file.model'

export type Applicant = {
  id: string
  candidateId: string
  projectId: string
  type: ApplicationType
  status: ApplicationStatus
  role: TeamRole
  cvUrl: string
  candidate: FullProfile
  cvFiles: ApplicationApplyFile[]
  createdTime: string
}
