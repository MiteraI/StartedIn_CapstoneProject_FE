import { PhaseState } from '../../enums/phase-status.enum'

export type CreateMilestone = {
  title: string
  description: string
  startDate: string
  endDate: string
  phaseEnum: PhaseState
}
