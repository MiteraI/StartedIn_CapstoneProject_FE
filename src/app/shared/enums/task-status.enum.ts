export enum TaskStatus {
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  PENDING = 3,
  REVIEW = 4,
  OPEN = 5,
  DONE = 6
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'Chưa Bắt Đầu',
  [TaskStatus.IN_PROGRESS]: 'Đang Làm',
  [TaskStatus.PENDING]: 'Tạm Gác',
  [TaskStatus.REVIEW]: 'Xem Xét',
  [TaskStatus.OPEN]: 'Mở Lại',
  [TaskStatus.DONE]: 'Hoàn Thành',
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'gray',
  [TaskStatus.IN_PROGRESS]: 'blue',
  [TaskStatus.PENDING]: 'orange',
  [TaskStatus.REVIEW]: 'purple',
  [TaskStatus.OPEN]: 'geekblue',
  [TaskStatus.DONE]: 'green',
}
