import { TransactionType } from "../../enums/transaction-type.enum";
import { TransactionAsset } from "../asset/transaction-asset.model";

export type TransactionCreateModel = {
  amount: number;
  fromId?: string;
  toId?: string;
  fromName?: string;
  toName?: string;
  type: TransactionType;
  isInFlow: boolean;
  content: string;
  assets?: TransactionAsset[];
}
