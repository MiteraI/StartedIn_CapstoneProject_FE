import { ProjectStatus } from "../../enums/project-status.enum";

export type ProjectModel = {
  id: string;
  projectName: string;
  description: string;
  projectStatus: ProjectStatus;
  logoUrl: string;
  totalShares: number;
  remainingPercentOfShares: number;
  remainingShares: number;
  startDate: string;
  endDate?: string;
}
