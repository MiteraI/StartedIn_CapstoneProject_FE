import { ProjectApprovalStatus } from "../../enums/project-approval-status.enum";

export type ProjectRegisterModel = {
    id: string
    projectId: string
    status: ProjectApprovalStatus
    rejectReason?: string
    createdTime: string
    lastUpdatedTime:string
}