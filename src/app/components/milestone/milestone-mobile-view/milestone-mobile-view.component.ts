import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzListModule } from 'ng-zorro-antd/list'
import { ProjectMilestoneModel } from 'src/app/shared/models/milestone/milestone.model'
import { PhaseState, PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'

@Component({
  selector: 'app-milestone-mobile-view',
  templateUrl: './milestone-mobile-view.component.html',
  styleUrls: ['./milestone-mobile-view.component.scss'],
  standalone: true,
  imports: [CommonModule, NzListModule, NzIconModule, FormsModule],
})
export class MilestoneMobileViewComponent implements OnInit {
  @Input({ required: true }) milestones: ProjectMilestoneModel[] = []
  @Input({ required: true }) projectId: string = ''
  searchText: string = ''

  protected readonly statusLabels: Record<PhaseState, string> = PhaseStateLabels

  ngOnInit() {}
}
