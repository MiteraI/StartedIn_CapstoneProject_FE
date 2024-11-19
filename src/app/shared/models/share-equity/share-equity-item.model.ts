import { TeamRole } from "../../enums/team-role.enum";

export type ShareEquityItemModel = {
  userId: string;
  userFullName: string;
  shareQuantity: number;
  percentage: number;
  stakeHolderType: TeamRole;
  dateAssigned: string;
}
