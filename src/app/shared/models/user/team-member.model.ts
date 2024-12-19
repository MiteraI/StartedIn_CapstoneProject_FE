import { TeamRole } from "../../enums/team-role.enum";

export type TeamMemberModel = {
  id: string;
  fullName: string;
  roleInTeam: TeamRole;
  email: string;
  profilePicture: string;
}
