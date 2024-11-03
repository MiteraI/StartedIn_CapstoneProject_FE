export enum PhaseState {
  INITIALIZING = 0,
  PLANNING = 1,
  EXECUTING = 2,
  CLOSING = 3,
}

export const PhaseStateLabels: Record<PhaseState, string> = {
  [PhaseState.INITIALIZING]: 'Khởi Tạo',
  [PhaseState.PLANNING]: 'Lên Kế Hoạch',
  [PhaseState.EXECUTING]: 'Thực Thi',
  [PhaseState.CLOSING]: 'Kết Thúc',
};
