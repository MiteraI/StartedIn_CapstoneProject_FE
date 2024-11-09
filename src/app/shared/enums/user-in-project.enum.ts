export enum ProjectRole {
  LEADER = 0,
  MEMBER = 1,
  INVESTOR = 2,
  MENTOR = 3,
}

export const ProjectRoleLabels: Record<ProjectRole, string> = {
  [ProjectRole.LEADER]: 'Trưởng Nhóm',
  [ProjectRole.MEMBER]: 'Thành Viên',
  [ProjectRole.INVESTOR]: 'Nhà Đầu Tư',
  [ProjectRole.MENTOR]: 'Mentor',
}
