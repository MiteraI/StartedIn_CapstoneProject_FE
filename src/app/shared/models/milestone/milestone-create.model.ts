import { PhaseState } from '../../enums/phase-status.enum'

export type CreateMilestone = {
  milstoneTitle: string
  description: string
  dueDate: Date
  phaseEnum: PhaseState
}
