export interface ProjectModel {
  id: string;
  projectName: string;
  description: string;
  projectStatus: string;
  logoUrl: string;
  totalShares: number;
  remainingPercentOfShares: number;
  remainingShares: number;
  startDate: string; // Date?
  endDate: string;
}
