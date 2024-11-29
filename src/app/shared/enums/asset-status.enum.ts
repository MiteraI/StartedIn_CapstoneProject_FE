export enum AssetStatus {
    AVAILABLE = 1,
    UNAVAILABLE = 2,
    INMANTAINANCE = 3
}

export const AssetStatusLabels : Record<AssetStatus,string> = {
    [AssetStatus.AVAILABLE]: 'Khả dụng',
    [AssetStatus.UNAVAILABLE]: 'Không khả dụng',
    [AssetStatus.INMANTAINANCE]: 'Đang bảo trì'
}