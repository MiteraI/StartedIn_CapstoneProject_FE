import { StartupModel } from '../models/project/startup.model';
import { InvestmentCallStatus } from '../enums/investment-call-status.enum';
import { addDays } from 'date-fns';

const sampleDescriptions = [
  'A revolutionary platform connecting students with mentors',
  'Innovative solution for campus sustainability',
  'AI-powered study assistance platform',
  'Student marketplace for academic resources',
  'Smart campus navigation system'
];

const sampleNames = [
  'EduConnect', 'GreenCampus', 'StudyAI',
  'CampusMarket', 'SmartNav', 'LearnHub',
  'EcoStudent', 'TechEdu', 'StudentFlow',
  'CampusTech'
];

const sampleLeaders = [
  'Nguyễn Văn An', 'Trần Thị Bình',
  'Lê Minh Cường', 'Phạm Thị Dung',
  'Hoàng Văn Em'
];

export function generateStartupSamples(count: number = 20): StartupModel[] {
  return Array(count).fill(null).map((_, index) => {
    const targetCall = Math.floor(Math.random() * 900000000) + 100000000;
    const amountRaised = Math.floor(Math.random() * targetCall);
    const equityShareCall = Math.floor(Math.random() * 30) + 10;
    const remainingShare = Math.floor(Math.random() * equityShareCall);

    return {
      id: `startup-${index + 1}`,
      projectName: sampleNames[index % sampleNames.length] + ` ${Math.floor(index / sampleNames.length) + 1}`,
      description: sampleDescriptions[index % sampleDescriptions.length],
      leaderFullName: sampleLeaders[index % sampleLeaders.length],
      logoUrl: `https://picsum.photos/seed/${index + 1}/400/300`,
      leaderProfilePicture: `https://i.pravatar.cc/150?img=${index + 1}`,
      investmentCall: {
        id: `call-${index + 1}`,
        status: Math.random() > 0.3 ? InvestmentCallStatus.OPEN : InvestmentCallStatus.CLOSED,
        targetCall: targetCall,
        amountRaised: amountRaised,
        equityShareCall: equityShareCall,
        remainAvailableEquityShare: remainingShare,
        startDate: new Date().toISOString(),
        endDate: addDays(new Date(), Math.floor(Math.random() * 30) + 1).toISOString(),
        totalInvestor: Math.floor(Math.random() * 20),
        projectId: '1',
        expand: true,
        dealOffers: []
      },
      leaderId: '1'
    };
  });
}

export function simulateStartupAPI(
  pageIndex: number,
  pageSize: number,
  projectName?: string,
  status?: InvestmentCallStatus,
  targetFrom?: number,
  targetTo?: number,
  raisedFrom?: number,
  raisedTo?: number,
  availableShareFrom?: number,
  availableShareTo?: number
) {
  // Generate a larger dataset
  const allStartups = generateStartupSamples(100);

  // Apply filters
  let filteredStartups = allStartups.filter(startup => {
    if (projectName && !startup.projectName.toLowerCase().includes(projectName.toLowerCase())) {
      return false;
    }

    if (status !== undefined && startup.investmentCall?.status !== status) {
      return false;
    }

    if (startup.investmentCall) {
      if (targetFrom && startup.investmentCall.targetCall < targetFrom) return false;
      if (targetTo && startup.investmentCall.targetCall > targetTo) return false;
      if (raisedFrom && startup.investmentCall.amountRaised < raisedFrom) return false;
      if (raisedTo && startup.investmentCall.amountRaised > raisedTo) return false;
      if (availableShareFrom && startup.investmentCall.remainAvailableEquityShare < availableShareFrom) return false;
      if (availableShareTo && startup.investmentCall.remainAvailableEquityShare > availableShareTo) return false;
    }

    return true;
  });

  // Calculate pagination
  const startIndex = (pageIndex - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStartups = filteredStartups.slice(startIndex, endIndex);

  return {
    data: paginatedStartups,
    page: 1,
    size: 15,
    total: 100
  };
}
