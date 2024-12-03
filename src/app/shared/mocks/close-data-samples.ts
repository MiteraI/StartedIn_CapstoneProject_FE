import { ContractType } from "../enums/contract-type.enum"
import { CheckProjectClosableModel } from "../models/project/check-project-closable.model"

// Mock data for when project cannot be closed
export const mockCannotCloseProject: CheckProjectClosableModel = {
  currentBudget: 5000000,
  disbursements: [
    {
      id: 'disb-1',
      amount: 2000000,
      contractIdNumber: 'HD-2024-001',
      title: 'Nguyễn Văn A'
    },
    {
      id: 'disb-2',
      amount: 3000000,
      contractIdNumber: 'HD-2024-002',
      title: 'Trần Thị B'
    }
  ],
  contracts: [
    {
      id: 'contract-1',
      contractName: 'Hợp đồng đầu tư vòng 1',
      contractIdNumber: 'HD-2024-001',
      contractType: ContractType.INTERNAL,
    },
    {
      id: 'contract-2',
      contractName: 'Hợp đồng mua sắm thiết bị',
      contractIdNumber: 'HD-2024-002',
      contractType: ContractType.INVESTMENT,
    }
  ],
  assets: [
    {
      id: 'asset-1',
      assetName: 'Máy tính xách tay',
      quantity: 3
    },
    {
      id: 'asset-2',
      assetName: 'Màn hình máy tính',
      quantity: 2
    }
  ]
}

// Mock data for when project can be closed
export const mockCanCloseProject: CheckProjectClosableModel = {
  currentBudget: 0,
  disbursements: [],
  contracts: [],
  assets: []
}

// Mock data with only remaining budget
export const mockOnlyBudgetRemaining: CheckProjectClosableModel = {
  currentBudget: 1000000,
  disbursements: [],
  contracts: [],
  assets: []
}

// Mock data with only pending disbursements
export const mockOnlyDisbursements: CheckProjectClosableModel = {
  currentBudget: 0,
  disbursements: [
    {
      id: 'disb-1',
      amount: 5000000,
      contractIdNumber: 'HD-2024-003',
      title: 'Lê Văn C'
    }
  ],
  contracts: [],
  assets: []
}

// Mock data with only active contracts
export const mockOnlyContracts: CheckProjectClosableModel = {
  currentBudget: 0,
  disbursements: [],
  contracts: [
    {
      id: 'contract-3',
      contractName: 'Hợp đồng thuê văn phòng',
      contractIdNumber: 'HD-2024-003',
      contractType: ContractType.INTERNAL,
    }
  ],
  assets: []
}

// Mock data with only unliquidated assets
export const mockOnlyAssets: CheckProjectClosableModel = {
  currentBudget: 0,
  disbursements: [],
  contracts: [],
  assets: [
    {
      id: 'asset-3',
      assetName: 'Máy in',
      quantity: 1
    }
  ]
}
