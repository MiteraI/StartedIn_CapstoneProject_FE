import { DisbursementCreateModel } from "../disbursement/disbursement-create.model";
import { ShareEquityCreateUpdateModel } from "../share-equity/share-equity-create-update.model";
import { ContractCreateUpdateModel } from "./contract-create-update.model";

export type InvestmentContractCreateUpdateModel = {
  contract: ContractCreateUpdateModel;
  investorInfo: ShareEquityCreateUpdateModel;
  disbursements: DisbursementCreateModel[];
}
