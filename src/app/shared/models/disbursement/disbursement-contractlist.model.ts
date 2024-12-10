import { DisbursementStatus } from "../../enums/disbursement-status.enum";

export type DisbursementContractList = {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    amount: number;
    disbursementStatus: DisbursementStatus;
}