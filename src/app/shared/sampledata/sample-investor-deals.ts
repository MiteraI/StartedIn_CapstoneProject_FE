import { DealStatus } from "../enums/deal-status.enum";
import { InvestorDealItem } from "../models/deal-offer/investor-deal-item.model";
import { SearchResponseModel } from "../models/search-response.model";

const sampleInvestorDeals: SearchResponseModel<InvestorDealItem> = {
  responseList: [
    {
      id: "deal-001",
      projectId: "proj-2024-001",
      projectName: "EcoTech Solutions",
      leaderId: "lead-001",
      leaderName: "Sarah Chen",
      amount: 500000,
      equityShareOffer: 15.5,
      termCondition: "First right of refusal on future funding rounds",
      dealStatus: DealStatus.WAITING
    },
    {
      id: "deal-002",
      projectId: "proj-2024-002",
      projectName: "HealthAI Platform",
      leaderId: "lead-001",
      leaderName: "Sarah Chen",
      amount: 750000,
      equityShareOffer: 20,
      termCondition: "Board seat for investments above $500k",
      dealStatus: DealStatus.ACCEPTED
    },
    {
      id: "deal-003",
      projectId: "proj-2024-003",
      projectName: "Urban Farming Network",
      leaderId: "lead-002",
      leaderName: "Michael Rodriguez",
      amount: 250000,
      equityShareOffer: 10,
      termCondition: "Quarterly performance reports and advisory role",
      dealStatus: DealStatus.REJECTED
    },
    {
      id: "deal-004",
      projectId: "proj-2024-004",
      projectName: "Blockchain Security Solutions",
      leaderId: "lead-002",
      leaderName: "Michael Rodriguez",
      amount: 1000000,
      equityShareOffer: 25,
      termCondition: "Vesting period of 3 years with 1 year cliff",
      dealStatus: DealStatus.WAITING
    },
    {
      id: "deal-005",
      projectId: "proj-2024-005",
      projectName: "Sustainable Energy Storage",
      leaderId: "lead-003",
      leaderName: "David Kumar",
      amount: 2000000,
      equityShareOffer: 30,
      termCondition: "Pro-rata rights and board observer seat",
      dealStatus: DealStatus.ACCEPTED
    },
    {
      id: "deal-006",
      projectId: "proj-2024-006",
      projectName: "EdTech Learning Platform",
      leaderId: "lead-003",
      leaderName: "David Kumar",
      amount: 300000,
      equityShareOffer: 12.5,
      termCondition: "Monthly financial reporting requirements",
      dealStatus: DealStatus.WAITING
    },
    {
      id: "deal-007",
      projectId: "proj-2024-007",
      projectName: "Smart City Infrastructure",
      leaderId: "lead-004",
      leaderName: "Emma Thompson",
      amount: 1500000,
      equityShareOffer: 27.5,
      termCondition: "Strategic partnership agreement included",
      dealStatus: DealStatus.WAITING
    },
    {
      id: "deal-008",
      projectId: "proj-2024-008",
      projectName: "Quantum Computing Research",
      leaderId: "lead-004",
      leaderName: "Emma Thompson",
      amount: 3000000,
      equityShareOffer: 35,
      termCondition: "IP sharing agreement and research collaboration",
      dealStatus: DealStatus.ACCEPTED
    },
    {
      id: "deal-009",
      projectId: "proj-2024-009",
      projectName: "Space Technology Solutions",
      leaderId: "lead-005",
      leaderName: "James Wilson",
      amount: 5000000,
      equityShareOffer: 40,
      termCondition: "Government contract participation rights",
      dealStatus: DealStatus.REJECTED
    },
    {
      id: "deal-010",
      projectId: "proj-2024-010",
      projectName: "Autonomous Vehicle Systems",
      leaderId: "lead-005",
      leaderName: "James Wilson",
      amount: 2500000,
      equityShareOffer: 32.5,
      termCondition: "Technology licensing agreements included",
      dealStatus: DealStatus.WAITING
    }
  ],
  pageIndex: 1,
  pageSize: 10,
  totalRecord: 18,
  totalPage: 2
}

export default sampleInvestorDeals;
