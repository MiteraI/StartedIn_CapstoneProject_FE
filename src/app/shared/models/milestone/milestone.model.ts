import { PhaseState } from '../../enums/phase-status.enum'

export type Milestone = {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  progress: number
  phaseName: PhaseState
}
