export type InvestmentCallResponseDto = {
  id: string
  projectId: string
  targetCall: number
  amountRaised: number
  remainAvailableEquityShare: number
  equityShareCall: number
  startDate: string
  endDate: string
  status: number
  totalInvestor: number
}
