import { TeamRole } from "../../enums/team-role.enum";

export type UserInviteModel = {
  email: string;
  roleInTeam: TeamRole;
}
