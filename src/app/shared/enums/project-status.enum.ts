export enum ProjectStatus {
  CONSTRUCTING = 0,
  ACTIVE = 1,
  CLOSED = 2
}

export const ProjectStatusLabels: Record<ProjectStatus, string> = {
  [ProjectStatus.CONSTRUCTING]: 'Đang kiến tạo',
  [ProjectStatus.ACTIVE]: 'Đang thực thi',
  [ProjectStatus.CLOSED]: 'Đã đóng',
};

