import { TransactionType } from "../../enums/transaction-type.enum";
import { AssetModel } from "../asset/asset.model";
import { DisbursementDetailModel } from "../disbursement/disbursement-detail.model";

export type TransactionModel = {
  id: string;
  projectId: string;
  amount: number;
  fromID: string;
  fromUserName: string;
  toID: string;
  toUserName: string;
  type: TransactionType;
  content: string;
  evidenceUrl: string;
  isInFlow: boolean;
  lastUpdatedTime: string;
  disbursement: DisbursementDetailModel;
  assets: AssetModel[];
}
