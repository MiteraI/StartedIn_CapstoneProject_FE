import { AssetStatus } from '../../enums/asset-status.enum'
import { TransactionModel } from '../transaction/transaction.model'

export type AssetModel = {
  id: string
  projectId: string
  assetName: string
  price: number
  purchaseDate: string
  quantity: number
  status: AssetStatus
  serialNumber: string
  remainQuantity: number
  transactionId: string | null
  transactions: TransactionModel[]
}
