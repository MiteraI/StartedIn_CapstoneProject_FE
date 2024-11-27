export type AssetCreateModel = {
    assetName: string;
    price: number | null;
    purchaseDate: string | null; // Allow null for purchaseDate
    quantity: number;
    serialNumber: string | null;
};