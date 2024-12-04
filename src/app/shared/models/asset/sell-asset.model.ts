export type SellAssetModel = {
  sellPrice: number;
  sellQuantity: number;
  toId?: string;
  toName?: string;
  evidenceFile: File;
}
