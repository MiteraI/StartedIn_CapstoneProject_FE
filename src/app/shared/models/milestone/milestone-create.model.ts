import { PhaseState } from '../../enums/phase-status.enum'

export type MilestoneCreateModel = {
  milstoneTitle: string
  description: string
  dueDate: Date
  phaseEnum: PhaseState
}
