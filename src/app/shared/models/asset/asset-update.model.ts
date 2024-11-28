import { AssetStatus } from "../../enums/asset-status.enum";

export type AssetUpdateModel = {
    assetName: string;
    price: number | null;
    purchaseDate: string | null; // Allow null for purchaseDate
    quantity: number;
    serialNumber: string | null;
    status: AssetStatus
};