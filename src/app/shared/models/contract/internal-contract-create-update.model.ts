import { ShareEquityCreateUpdateModel } from "../share-equity/share-equity-create-update.model";
import { ContractCreateUpdateModel } from "./contract-create-update.model";

export type InternalContractCreateUpdateModel = {
  contract: ContractCreateUpdateModel;
  shareEquitiesOfMembers: ShareEquityCreateUpdateModel[];
}
