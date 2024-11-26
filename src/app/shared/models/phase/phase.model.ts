import { MilestonePhaseModel } from '../milestone/milestone-phase.model'

export type Phase = {
  id: string
  phaseName: string
  startDate: string
  endDate: string
  projectCharterId: string
  milestones: MilestonePhaseModel[]
  expand: boolean
}
