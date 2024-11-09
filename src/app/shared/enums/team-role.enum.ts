export enum TeamRole {
  LEADER = 0,
  MEMBER = 1,
  INVESTOR = 2,
  MENTOR = 3,
}

export const TeamRoleLabels: Record<TeamRole, string> = {
  [TeamRole.LEADER]: 'Trưởng nhóm',
  [TeamRole.MEMBER]: 'Thành viên',
  [TeamRole.INVESTOR]: 'Nhà đầu tư',
  [TeamRole.MENTOR]: 'Người hướng dẫn',
}
