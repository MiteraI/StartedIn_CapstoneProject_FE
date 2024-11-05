import { DealStatus } from "../../enums/deal-status.enum";

export type InvestorDealItem = {
  id: string;
  projectId: string;
  projectName: string;
  leaderId: string;
  leaderName: string;
  amount: number;
  equityShareOffer: number;
  termCondition: string;
  dealStatus: DealStatus;
}
