export enum AssetStatus {
    AVAILABLE = 1,
    SOLD = 2,
    INMANTAINANCE = 3
}

export const AssetStatusLabels : Record<AssetStatus,string> = {
    [AssetStatus.AVAILABLE]: 'Khả dụng',
    [AssetStatus.SOLD]: 'Đã thanh lý',
    [AssetStatus.INMANTAINANCE]: 'Đang bảo trì'
}