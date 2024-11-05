import { DealStatus } from "../../enums/deal-status.enum";

export type ProjectDealItem = {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  equityShareOffer: number;
  termCondition: string;
  dealStatus: DealStatus;
}
