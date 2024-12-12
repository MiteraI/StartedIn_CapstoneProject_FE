export enum TerminationStatus {
  PENDING = 1,
  ACCEPTED = 2,
  REJECTED = 3,
}

export const TerminationStatusLabels : Record<TerminationStatus, string> = {
  [TerminationStatus.PENDING]: 'Đang chờ',
  [TerminationStatus.ACCEPTED]: 'Đã chấp nhận',
  [TerminationStatus.REJECTED]: 'Đã từ chối'
}
