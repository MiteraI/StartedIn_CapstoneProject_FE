export enum UserStatusInProject {
    ACTIVE = 1,
    LEFT = 2
}
  
export const UserStatusInProjectLabels: Record<UserStatusInProject, string> = {
    [UserStatusInProject.ACTIVE]: 'Hoạt động',
    [UserStatusInProject.LEFT]: 'Đã rời',
}
  