import { UnliquidatedAssetModel } from "../asset/unliquidated-asset.model";
import { ValidContractModel } from "../contract/valid-contract.model";
import { PendingDisbursementModel } from "../disbursement/pending-disbursement.model";

export type CheckProjectClosableModel = {
  currentBudget: number;
  contracts: ValidContractModel[];
  disbursements: PendingDisbursementModel[];
  assets: UnliquidatedAssetModel[];
}
