export type MilestoneCreateDto = {
  milstoneTitle: string
  description: string
  dueDate: string // Use Date type if you want to handle date objects
  phaseEnum: number // Adjust type based on your phase enumeration
}

export type ProjectCharterFormModel = {
  businessCase: string
  goal: string
  objective: string
  scope: string
  constraints: string
  assumptions: string
  deliverables: string
  listMilestoneCreateDto: MilestoneCreateDto[]
}
