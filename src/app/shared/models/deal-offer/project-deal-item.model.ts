import { DealStatus } from "../../enums/deal-status.enum";
import { DisbursementModel } from "../disbursement/disbursement.model";

export type ProjectDealItem = {
  id: string;
  investorId: string;
  investorName: string;
  amount: number;
  equityShareOffer: number;
  termCondition: string;
  dealStatus: DealStatus;
  disbursements: DisbursementModel[];
}
