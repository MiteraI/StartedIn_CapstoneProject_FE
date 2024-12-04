import { AssetStatus } from "../../enums/asset-status.enum";

export type AssetUpdateModel = {
  quantity: number;
  status: AssetStatus
};
