export enum TaskStatus {
  NOT_STARTED = 1,
  IN_PROGRESS = 2,
  PENDING = 3,
  OPEN = 4,
  DONE = 5
}

export const TaskStatusLabels: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'Chưa Bắt Đầu',
  [TaskStatus.IN_PROGRESS]: 'Đang Làm',
  [TaskStatus.PENDING]: 'Tạm Gác',
  [TaskStatus.OPEN]: 'Mở Lại',
  [TaskStatus.DONE]: 'Hoàn Thành',
}

export const TaskStatusColors: Record<TaskStatus, string> = {
  [TaskStatus.NOT_STARTED]: 'gray',
  [TaskStatus.IN_PROGRESS]: 'blue',
  [TaskStatus.PENDING]: 'orange',
  [TaskStatus.OPEN]: 'cyan',
  [TaskStatus.DONE]: 'green',
}
