import { TerminationStatus } from '../enums/termination-status.enum';
import { TerminationRequestModel } from '../models/termination-request/termination-request.model';

const mockTerminationRequests: TerminationRequestModel[] = [
  {
    id: '1',
    contractId: 'HD-2024-001',
    contractIdNumber: 'HD-2024-001',
    fromId: 'user-1',
    fromName: 'Nguyễn Văn A',
    reason: 'Project completion',
    isAgreed: true,
    createdTime: new Date('11/22/2024').toISOString(),
    lastUpdatedTime: new Date('11/22/2024').toISOString(),
  },
  {
    id: '2',
    contractId: 'HD-2024-002',
    contractIdNumber: 'HD-2024-002',
    fromId: 'user-2',
    fromName: 'Trần Thị B',
    reason: 'Budget constraints',
    isAgreed: false,
    createdTime: new Date('11/11/2023').toISOString(),
    lastUpdatedTime: new Date('11/22/2024').toISOString(),
  },
  {
    id: '3',
    contractId: 'HD-2024-003',
    contractIdNumber: 'HD-2024-003',
    fromId: 'user-3',
    fromName: 'Lê Văn C',
    reason: 'Change in project direction',
    isAgreed: null,
    createdTime: new Date().toISOString(),
    lastUpdatedTime: new Date('11/22/2024').toISOString(),
  },
  {
    id: '4',
    contractId: 'HD-2024-004',
    contractIdNumber: 'HD-2024-004',
    fromId: 'user-4',
    fromName: 'Phạm Văn D',
    reason: 'Legal issues',
    createdTime: new Date().toISOString(),
    lastUpdatedTime: new Date('11/22/2024').toISOString(),
  },
  {
    id: '5',
    contractId: 'HD-2024-005',
    contractIdNumber: 'HD-2024-005',
    fromId: 'user-5',
    fromName: 'Nguyễn Thị E',
    reason: 'Project cancellation',
    isAgreed: true,
    createdTime: new Date().toISOString(),
    lastUpdatedTime: new Date('11/22/2024').toISOString(),
  },
];

export function simulateGetList(projectId: string): TerminationRequestModel[] {
  return mockTerminationRequests;
}

export function simulateGet(projectId: string, id: string): TerminationRequestModel | undefined {
  return mockTerminationRequests.find(request => request.id === id);
}
