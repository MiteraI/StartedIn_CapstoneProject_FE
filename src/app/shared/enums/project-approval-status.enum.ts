export enum ProjectApprovalStatus {
    PENDING = 1,
    ACCEPTED = 2,
    REJECTED = 3
}
  
export const ProjectApprovalStatusLabel: Record<ProjectApprovalStatus, string> = {
    [ProjectApprovalStatus.PENDING]: 'Đang chờ',
    [ProjectApprovalStatus.ACCEPTED]: 'Đã chấp nhận',
    [ProjectApprovalStatus.REJECTED]: 'Đã từ chối',
}