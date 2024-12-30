import { Component, Input, OnInit } from '@angular/core'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { MilestoneListItemComponent } from './milestone-list-item/milestone-list-item.component'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { UpdateMilestoneModalComponent } from '../update-milestone-modal/update-milestone-modal.component'
import { NzSpinModule } from 'ng-zorro-antd/spin'

@Component({
  selector: 'app-milestone-list',
  templateUrl: './milestone-list.component.html',
  styleUrls: ['./milestone-list.component.scss'],
  standalone: true,
  imports: [MilestoneListItemComponent, NzModalModule, NzSpinModule],
})
export class MilestoneListComponent {
  @Input({ required: true }) milestoneList: Milestone[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() isLeader: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1

  constructor(private modalService: NzModalService) {}

  openUpdateMilestoneModal(milestoneId: string) {
    if (!this.isLeader) {
      return;
    }
    const modalRef = this.modalService.create({
      nzTitle: 'Thông Tin Cột Mốc',
      nzStyle: { top: '20px', maxWidth: '800px' },
      nzBodyStyle: { padding: '0px' },
      nzWidth: '90vw',
      nzContent: UpdateMilestoneModalComponent,
      nzData: {
        milestoneId: milestoneId,
        projectId: this.projectId,
      },
      nzFooter: null,
    });
  }
}
