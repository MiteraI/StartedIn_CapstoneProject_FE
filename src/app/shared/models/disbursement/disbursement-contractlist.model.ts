import { DisbursementStatus } from "../../enums/disbursement-status.enum";

export type DisbursementContractList = {
    id: string;
    title: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    disbursementStatus: DisbursementStatus;
}