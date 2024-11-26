import { InvestmentCallStatus } from '../../enums/investment-call-status.enum'
import { InvestorDealItem } from '../deal-offer/investor-deal-item.model'

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
  expand: boolean
  dealOffers: InvestorDealItem[]
}
