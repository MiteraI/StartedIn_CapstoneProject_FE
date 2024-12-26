import { ProjectApprovalStatus } from '../../enums/project-approval-status.enum'

export type ProjectApprovalDetail = {
  leaderName: string
  projectName: string
  reason: string
  status: ProjectApprovalStatus
  sentDate: string
  approvalDate: string
  documents: Document[]
  id: string
  rejectReason: string
  targetCall: number,
  equityShareCall: number,
  endDate: Date,
  projectId: string,
  companyIdNumber: string
}

export type Document = {
  documentName: string
  description: null
  attachmentLink: string
  projectId: string
  projectApprovalId: string
  id: string
}
