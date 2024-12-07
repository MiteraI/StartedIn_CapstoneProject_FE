import { TeamRole } from "../../enums/team-role.enum";

export type ShareEquityCreateUpdateModel = {
  userId: string;
  fullName?: string;
  percentage: number;
  buyPrice: number;
  stakeHolderType?: TeamRole;
}
