export enum TaskStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  PENDING = 2,
  REVIEW = 3,
  OPEN = 4,
  DONE = 5
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'Chưa Bắt Đầu',
  [TaskStatus.IN_PROGRESS]: 'Đang Làm',
  [TaskStatus.PENDING]: 'Tạm Gác',
  [TaskStatus.REVIEW]: 'Xem Xét',
  [TaskStatus.OPEN]: 'Mở Lại',
  [TaskStatus.DONE]: 'Hoàn Thành',
}
