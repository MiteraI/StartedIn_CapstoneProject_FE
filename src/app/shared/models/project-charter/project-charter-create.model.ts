import { PhaseCreateDto } from "../phase/phase-create.model"

export type ProjectCharterFormModel = {
  businessCase: string
  goal: string
  objective: string
  scope: string
  constraints: string
  assumptions: string
  deliverables: string
  listCreatePhaseDtos: PhaseCreateDto[]
}
