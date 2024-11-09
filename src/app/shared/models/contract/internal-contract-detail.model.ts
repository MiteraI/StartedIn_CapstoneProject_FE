import { ContractStatus } from "../../enums/contract-status.enum";
import { ShareEquityCreateUpdateModel } from "../share-equity/share-equity-create-update.model";

export type InternalContractDetailModel = {
  id: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  shareEquities: ShareEquityCreateUpdateModel[];
}
