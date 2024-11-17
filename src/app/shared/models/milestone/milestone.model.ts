import { PhaseState } from '../../enums/phase-status.enum'

export type Milestone = {
  id: string
  title: string
  description: string
  dueDate: string
  extendedDate: string
  extendedCount: number
  phaseName: PhaseState
}
