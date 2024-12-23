import { MeetingNoteDetail } from "../meeting/meeting-note/meeting-note-detail.model";

export type LeaderTransferHistoryModel= {
  id: string;
  projectId: string;
  formerLeaderId: string;
  formerLeaderName: string;
  formerLeaderEmail?: string;
  formerLeaderProfilePicture?: string;
  newLeaderId: string;
  newLeaderName: string;
  newLeaderEmail?: string;
  newLeaderProfilePicture?: string;
  transferDate: string;
  isAgreed: boolean;
  appointmentId: string;
  appointmentName: string;
  appointmentTime: string;
  meetingNotes: MeetingNoteDetail[];
}
