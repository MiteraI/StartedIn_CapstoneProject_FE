export type TerminationRequestModel = {
  id: string;
  contractId: string;
  contractIdNumber: string;
  reason: string;
  createdTime: string;
  fromId: string;
  fromName: string;
  isAgreed?: boolean | null;
  lastUpdatedTime: string;
}
