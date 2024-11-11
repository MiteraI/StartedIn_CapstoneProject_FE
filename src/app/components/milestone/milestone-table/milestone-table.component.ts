import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum';
import { ProjectMilestoneModel } from 'src/app/shared/models/milestone/milestone.model';

@Component({
  selector: 'app-milestone-table',
  templateUrl: './milestone-table.component.html',
  styleUrls: ['./milestone-table.component.scss'],
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule, NzModalModule, CommonModule],
})
export class MilestoneTableComponent implements OnInit {
  @Input({ required: true }) milestones: ProjectMilestoneModel[] = []
  @Input({ required: true }) projectId: string = ''
  statusLabels = PhaseStateLabels

  constructor() {}

  ngOnInit() {}
}
