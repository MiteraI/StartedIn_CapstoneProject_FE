export enum Authority {
  ADMIN = 'Admin',
  USER = 'User',
  MENTOR = 'Mentor',
  INVESTOR = 'Investor',
}

export const AuthorityLabels : Record<Authority, string> = {
  [Authority.ADMIN]: 'Quản trị viên',
  [Authority.USER]: 'Sinh viên',
  [Authority.MENTOR]: 'Người hướng dẫn',
  [Authority.INVESTOR]: 'Nhà đầu tư'
}
