import { ApplicationStatus } from "../../enums/application-status.enum";
import { ApplicationType } from "../../enums/application-type.enum";
import { TeamRole } from "../../enums/team-role.enum";

export type PendingInvitationModel = {
  id: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhoneNumber: string;
  candidateProfilePicture: string;
  //status: ApplicationStatus;
  //type: ApplicationType;
  role: TeamRole;
}
