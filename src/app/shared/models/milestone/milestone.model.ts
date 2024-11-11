import { PhaseState } from "../../enums/phase-status.enum"

export type ProjectMilestoneModel = {
  title: string
  description: string
  dueDate: Date
  extendedDate: Date | null
  extendedCount: number | null
  phaseName: PhaseState
  id: string
}
