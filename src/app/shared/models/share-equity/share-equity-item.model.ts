import { TeamRole } from "../../enums/team-role.enum";

export type ShareEquityItemModel = {
  userId: string;
  userFullName: string;
  percentage: number;
  stakeHolderType: TeamRole;
  dateAssigned: string;
}
