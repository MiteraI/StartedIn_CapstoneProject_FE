import { ContractStatus } from "../../enums/contract-status.enum";
import { MeetingDetailModel } from "../meeting/meeting-detail.model";
import { ShareEquityCreateUpdateModel } from "../share-equity/share-equity-create-update.model";

export type InternalContractDetailModel = {
  id: string;
  contractName: string;
  contractPolicy: string;
  contractIdNumber: string;
  contractStatus: ContractStatus;
  validDate: string;
  expiredDate?: string;
  projectName?: string;
  liquidationNoteId?: string;
  shareEquities: ShareEquityCreateUpdateModel[];
  appointments: MeetingDetailModel[];
}
