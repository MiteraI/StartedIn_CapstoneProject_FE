import { RecruitmentImage } from './recruitment-image.model'

export type RecruitmentPostDetails = {
  id: string
  projectId: string
  projectName: string
  title: string
  content: string
  isOpen: boolean
  leaderId: string
  leaderName: string
  leaderAvatarUrl: string
  logoUrl: string
  createdTime: string
  lastUpdatedTime: string
  recruitmentImgs: RecruitmentImage[]
}
