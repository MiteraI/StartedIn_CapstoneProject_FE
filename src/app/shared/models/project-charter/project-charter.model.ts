import { Phase } from '../phase/phase.model'

export type ProjectCharter = {
  id: string
  projectId: string
  businessCase: string
  goal: string
  objective: string
  scope: string
  constraints: string
  assumptions: string
  deliverables: string
  phases: Phase[]
}
