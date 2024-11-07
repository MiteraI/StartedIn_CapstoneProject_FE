import { Component, inject, Input, OnInit } from '@angular/core'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { PhaseState, PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum';

@Component({
  selector: 'app-view-milestone-modal',
  templateUrl: './view-milestone-modal.component.html',
  styleUrls: ['./view-milestone-modal.component.scss'],
})
export class ViewMilestoneModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  milestoneData: any
  phaseLabel = ''

  constructor() {}

  ngOnInit() {
    this.milestoneData = this.nzModalData.milestoneData
    // Convert phaseEnum to phaseLabel
    const phaseEnum: PhaseState = this.milestoneData.phaseEnum;
    this.phaseLabel = PhaseStateLabels[phaseEnum] || 'Unknown';
  }
}
