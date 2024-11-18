export enum ProjectStatus {
  CONSTRUCTING = 1,
  ACTIVE = 2,
  CLOSED = 3
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.CONSTRUCTING]: 'Đang kiến tạo',
  [ProjectStatus.ACTIVE]: 'Đang thực thi',
  [ProjectStatus.CLOSED]: 'Đã đóng',
};

