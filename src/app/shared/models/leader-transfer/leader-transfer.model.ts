import { MeetingStatus } from "../../enums/meeting-status.enum";
import { MeetingNoteDetail } from "../meeting/meeting-note/meeting-note-detail.model";

export type LeaderTransfer = {
  id: string;
  projectId: string;
  formerLeaderId: string;
  formerLeaderName: string;
  isAgreed?: boolean;
  appointmentId: string;
  appointmentTitle: string;
  appointmentTime: string;
  description: string;
  meetingStatus: MeetingStatus;
  meetingNotes: MeetingNoteDetail[];
}
