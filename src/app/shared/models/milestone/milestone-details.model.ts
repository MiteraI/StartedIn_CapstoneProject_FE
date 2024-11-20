import { PhaseState } from "../../enums/phase-status.enum"

export type MilestoneDetails = {
  id: string
  title: string
  description: string
  dueDate: string
  extendedDate: string
  extendedCount: number
  phaseName: PhaseState
  percentage: number
  charterId: string
}