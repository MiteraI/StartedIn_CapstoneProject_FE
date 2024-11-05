import { ExploreProjectsListItemModel } from "../models/project/explore-projects-list-item.model";
import { SearchResponseModel } from "../models/search-response.model";

const sampleInvestorProjects: SearchResponseModel<ExploreProjectsListItemModel> = {
  responseList: [
    {
      id: "proj-001",
      projectName: "EcoSmart Solutions",
      description: "Developing sustainable smart home technology for energy efficiency and waste reduction",
      logoUrl: "/images/ecosmart-logo.png",
      leaderId: "lead-001",
      leaderFullName: "Sarah Chen"
    },
    {
      id: "proj-002",
      projectName: "HealthTech AI",
      description: "AI-powered diagnostic tools for early disease detection and prevention",
      logoUrl: "/images/healthtech-logo.png",
      leaderId: "lead-002",
      leaderFullName: "Michael Rodriguez"
    },
    {
      id: "proj-003",
      projectName: "FinSecure",
      description: "Blockchain-based security solutions for financial institutions",
      logoUrl: "/images/finsecure-logo.png",
      leaderId: "lead-003",
      leaderFullName: "David Kumar"
    },
    {
      id: "proj-004",
      projectName: "Urban Mobility",
      description: "Electric vehicle sharing platform for sustainable urban transportation",
      logoUrl: "/images/urban-mobility-logo.png",
      leaderId: "lead-004",
      leaderFullName: "Emma Thompson"
    },
    {
      id: "proj-005",
      projectName: "AgriTech Solutions",
      description: "Smart farming technology for optimizing crop yields and resource management",
      logoUrl: "/images/agritech-logo.png",
      leaderId: "lead-005",
      leaderFullName: "James Wilson"
    }
  ],
  pageIndex: 1,
  pageSize: 5,
  totalRecord: 18,
  totalPage: 4
}

export default sampleInvestorProjects;
