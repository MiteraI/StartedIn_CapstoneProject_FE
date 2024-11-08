import { DisbursementCreateModel } from "../disbursement/disbursement-create.model";
import { ContractCreateUpdateModel } from "./contract-create-update.model";

export type ContractCreateFromDealModel = {
  dealId: string;
  contract: ContractCreateUpdateModel;
  disbursements: DisbursementCreateModel[];
}
