import { TerminationStatus } from "../../enums/termination-status.enum";

export type TerminationRequestModel = {
  id: string;
  contractId: string;
  contractIdNumber: string;
  fromId: string,
  fromName: string,
  reason: string;
  createdTime: string;
  status: TerminationStatus;
  userParties: UserParty[];
}

type UserParty = {
  toId: string,
  toName: string,
  isAgreed: boolean
}
