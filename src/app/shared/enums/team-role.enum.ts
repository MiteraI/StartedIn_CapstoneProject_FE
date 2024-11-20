export enum TeamRole {
  LEADER = 1,
  MEMBER = 2,
  INVESTOR = 3,
  MENTOR = 4
}

export const TeamRoleLabels: Record<TeamRole, string> = {
  [TeamRole.LEADER]: 'Trưởng nhóm',
  [TeamRole.MEMBER]: 'Thành viên',
  [TeamRole.INVESTOR]: 'Nhà đầu tư',
  [TeamRole.MENTOR]: 'Người hướng dẫn',
}
