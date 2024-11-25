import { InvestmentCallStatus } from '../../enums/investment-call-status.enum'

export type InvestmentCallResponseDto = {
  id: string
  projectId: string
  targetCall: number
  amountRaised: number
  remainAvailableEquityShare: number
  equityShareCall: number
  startDate: string
  endDate: string
  status: InvestmentCallStatus
  totalInvestor: number
}
