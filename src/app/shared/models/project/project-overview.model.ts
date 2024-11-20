import type { InvestmentCallResponseDto } from "../investment-call/investment-call-response-dto.model" 
import type { ProjectCharter } from "../project-charter/project-charter.model"

export type ProjectOveriewModel = {
  id: string
  projectName: string
  description: string
  leaderId: string
  leaderFullName: string
  projectStatus: number
  logoUrl: string
  totalShares: number
  remainingPercentOfShares: number
  remainingShares: number
  startDate: string
  endDate: string
  investmentCallResponseDto: InvestmentCallResponseDto
  projectCharterResponseDto: ProjectCharter
}