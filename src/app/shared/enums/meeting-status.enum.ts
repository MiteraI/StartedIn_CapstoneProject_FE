export enum MeetingStatus {
  PROPOSED = 1,
  ONGOING = 2,
  FINISHED = 3,
  CANCELLED = 4,
}

export const MeetingLabel: Record<MeetingStatus, string> = {
  [MeetingStatus.PROPOSED]: 'Đã tạo',
  [MeetingStatus.ONGOING]: 'Đang diễn ra',
  [MeetingStatus.FINISHED]: 'Hoành thành',
  [MeetingStatus.CANCELLED]: 'Hủy',
}
