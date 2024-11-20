import { AssetStatus } from "../../enums/asset-status.enum";

export type AssetModel = {
  id: string;
  projectId: string;
  assetName: string;
  price: number;
  purchaseDate: string;
  quantity: number;
  assetStatus: AssetStatus;
  serialNumber: string;
}
