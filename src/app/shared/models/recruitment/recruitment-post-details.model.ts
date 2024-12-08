import { RecruitmentImage } from "./recruitment-image.model"

export type RecruitmentPostDetails = {
  id: string
  projectId: string
  title: string
  content: string
  isOpen: boolean
  leaderId: string
  leaderName: string
  leaderAvatarUrl: string
  recruitmentImgs: RecruitmentImage[]
}