import { Component, inject, OnInit } from '@angular/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

interface IModalData {
  milestoneId: string
  projectId: string
}

@Component({
  selector: 'app-update-milestone-modal',
  templateUrl: './update-milestone-modal.component.html',
  styleUrls: ['./update-milestone-modal.component.scss'],
})
export class UpdateMilestoneModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)

  constructor() {}

  ngOnInit() {}
}
