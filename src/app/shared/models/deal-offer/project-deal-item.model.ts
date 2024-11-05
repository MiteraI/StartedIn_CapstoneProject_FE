import { DealStatus } from "../../enums/deal-status.enum";

export type ProjectDealItem = {
  id: string;
  investorId: string;
  investorFullName: string;
  amount: number;
  equityShareOffer: number;
  termCondition: string;
  dealStatus: DealStatus;
}
