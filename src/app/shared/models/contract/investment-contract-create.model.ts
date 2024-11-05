import { DisbursementCreateModel } from "../disbursement/disbursement-create.model";
import { ShareEquityCreateModel } from "../share-equity/share-equity-create.model";
import { ContractCreateModel } from "./contract-create.model";

export type InvestmentContractCreateModel = {
  contract: ContractCreateModel;
  investorInfo: ShareEquityCreateModel;
  disbursements: DisbursementCreateModel[];
}
