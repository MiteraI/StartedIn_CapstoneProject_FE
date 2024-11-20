export enum AssetStatus {
    Available = 1,
    Sold = 2,
    InMaintainance = 3
}

export const AssetStatusLabels : Record<AssetStatus,string> = {
    [AssetStatus.Available]: 'Khả dụng',
    [AssetStatus.Sold]: 'Đã thanh lý',
    [AssetStatus.InMaintainance]: 'Đang bảo trì'
}