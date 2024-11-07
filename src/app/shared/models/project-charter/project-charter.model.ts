export type Milestone = {
  id: string
  title: string
  description: string
  dueDate: string 
  extendedDate: string 
  extendedCount: number
  phaseName: number
}

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
  milestones: Milestone[]
}
