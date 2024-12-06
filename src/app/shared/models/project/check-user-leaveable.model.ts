import { ValidContractModel } from "../contract/valid-contract.model"
import { PendingDisbursementModel } from "../disbursement/pending-disbursement.model";

export type CheckUserLeaveableModel = {
  contracts: ValidContractModel[];
  disbursements: PendingDisbursementModel[];
  requestExisted: boolean;
}
