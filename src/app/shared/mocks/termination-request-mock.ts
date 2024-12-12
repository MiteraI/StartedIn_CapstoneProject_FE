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
    createdTime: new Date('11/22/2024').toISOString(),
    status: TerminationStatus.PENDING,
    userParties: [
      { toId: 'user-2', toName: 'Trần Thị B', isAgreed: true },
      { toId: 'user-3', toName: 'Lê Văn C', isAgreed: false },
    ],
  },
  {
    id: '2',
    contractId: 'HD-2024-002',
    contractIdNumber: 'HD-2024-002',
    fromId: 'user-2',
    fromName: 'Trần Thị B',
    reason: 'Budget constraints',
    createdTime: new Date('11/11/2023').toISOString(),
    status: TerminationStatus.ACCEPTED,
    userParties: [
      { toId: 'user-1', toName: 'Nguyễn Văn A', isAgreed: true },
      { toId: 'user-4', toName: 'Phạm Văn D', isAgreed: true },
    ],
  },
  {
    id: '3',
    contractId: 'HD-2024-003',
    contractIdNumber: 'HD-2024-003',
    fromId: 'user-3',
    fromName: 'Lê Văn C',
    reason: 'Change in project direction',
    createdTime: new Date().toISOString(),
    status: TerminationStatus.REJECTED,
    userParties: [
      { toId: 'user-5', toName: 'Nguyễn Thị E', isAgreed: false },
    ],
  },
  {
    id: '4',
    contractId: 'HD-2024-004',
    contractIdNumber: 'HD-2024-004',
    fromId: 'user-4',
    fromName: 'Phạm Văn D',
    reason: 'Legal issues',
    createdTime: new Date().toISOString(),
    status: TerminationStatus.PENDING,
    userParties: [
      { toId: 'user-1', toName: 'Nguyễn Văn A', isAgreed: false },
      { toId: 'user-2', toName: 'Trần Thị B', isAgreed: true },
    ],
  },
  {
    id: '5',
    contractId: 'HD-2024-005',
    contractIdNumber: 'HD-2024-005',
    fromId: 'user-5',
    fromName: 'Nguyễn Thị E',
    reason: 'Project cancellation',
    createdTime: new Date().toISOString(),
    status: TerminationStatus.ACCEPTED,
    userParties: [
      { toId: 'user-3', toName: 'Lê Văn C', isAgreed: true },
      { toId: 'user-4', toName: 'Phạm Văn D', isAgreed: true },
    ],
  },
];

export function simulateGetList(projectId: string): TerminationRequestModel[] {
  return mockTerminationRequests;
}

export function simulateGet(projectId: string, id: string): TerminationRequestModel | undefined {
  return mockTerminationRequests.find(request => request.id === id);
}
