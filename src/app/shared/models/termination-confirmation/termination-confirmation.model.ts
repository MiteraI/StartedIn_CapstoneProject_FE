export interface TerminationConfirmationModel {
  id: string;
  terminationRequestId: string;
  reason: string;
  contractId: string;
  contractIdNumber: string;
  fromId: string;
  fromName: string;
  isAgreed: boolean;
  lastUpdatedTime: string;
}
