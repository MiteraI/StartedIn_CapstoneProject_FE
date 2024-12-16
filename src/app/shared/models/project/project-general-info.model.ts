import { TeamMemberModel } from '../user/team-member.model'

export type ProjectGeneralInformationModel = {
  projectName: string
  description: string
  logoUrl: string
  members: TeamMemberModel[]
  id: string
  startDate: string
}
