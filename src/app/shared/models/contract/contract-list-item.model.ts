import { ContractStatus } from "../../enums/contract-status.enum";
import { ContractType } from "../../enums/contract-type.enum";
import { MeetingStatus } from "../../enums/meeting-status.enum";
import { DisbursementContractList } from "../disbursement/disbursement-contractlist.model";
import { ContractPartyModel } from "./contract-party.model";

export type ContractListItemModel = {
  id: string;
  contractName: string;
  contractIdNumber: string;
  contractType: ContractType;
  parties: ContractPartyModel[];
  lastUpdatedTime: string;
  contractStatus: ContractStatus;
  validDate?: string;
  totalDisbursementAmount: number;
  disbursedAmount: number;
  pendingAmount: number;
  liquidationNoteId?: string;
  parentContractId?: string;
  currentTerminationRequestId?: string;
  terminationMeetingId?: string;
  meetingStatus: MeetingStatus;
  disbursements: DisbursementContractList[];
  expand: boolean;
}
