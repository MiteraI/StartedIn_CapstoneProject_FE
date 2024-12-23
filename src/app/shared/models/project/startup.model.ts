import { InvestmentCallResponseDto } from "../investment-call/investment-call-response-dto.model";

export type StartupModel = {
  id: string;
  projectName: string;
  description: string;
  logoUrl: string;
  leaderId: string;
  leaderFullName: string;
  leaderProfilePicture: string;
  investmentCall: InvestmentCallResponseDto | null;
}

