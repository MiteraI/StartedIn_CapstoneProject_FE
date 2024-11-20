export enum PhaseState {
  INITIALIZING = 1,
  PLANNING = 2,
  EXECUTING = 3,
  CLOSING = 4
}

export const PhaseStateLabels: Record<PhaseState, string> = {
  [PhaseState.INITIALIZING]: 'Khởi Tạo',
  [PhaseState.PLANNING]: 'Lên Kế Hoạch',
  [PhaseState.EXECUTING]: 'Thực Thi',
  [PhaseState.CLOSING]: 'Kết Thúc',
}
