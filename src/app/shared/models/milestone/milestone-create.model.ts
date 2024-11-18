import { PhaseState } from '../../enums/phase-status.enum'

export type CreateMilestone = {
  title: string
  description: string
  dueDate: Date
  phaseEnum: PhaseState
}
