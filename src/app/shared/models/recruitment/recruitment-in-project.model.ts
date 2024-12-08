import { RecruitmentImage } from "./recruitment-image.model"

export type RecruitmentInProject = {
    id: string
    title: string
    content: string
    isOpen: boolean
    recruitmentImgs: RecruitmentImage[]
}
