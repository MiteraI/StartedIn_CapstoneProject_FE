import { DisbursementCreateModel } from "../disbursement/disbursement-create.model";

export type DealOfferCreateModel = {
  projectId: string;
  amount: number;
  equityShareOffer: number;
  termCondition: string;
  disbursements: DisbursementCreateModel[];
}
