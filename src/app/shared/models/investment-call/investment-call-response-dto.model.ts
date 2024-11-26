import { InvestmentCallStatus } from '../../enums/investment-call-status.enum'
import { ProjectDealItem } from '../deal-offer/project-deal-item.model'

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
  dealOffers: ProjectDealItem[]
}
