import { Component, Input, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ProjectOverviewService } from 'src/app/services/project-overview.service'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { PhaseState } from 'src/app/shared/enums/phase-status.enum'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { NzTableModule } from 'ng-zorro-antd/table'
import { ProjectCharterDetailsComponent } from '../../../project-charter/project-charter-details/project-charter-details.component'
import { ProjectDetailComponent } from 'src/app/components/project-charter/project-detail/project-detail.component'

@Component({
  selector: 'app-project-charter',
  templateUrl: './project-charter.component.html',
  styleUrls: ['./project-charter.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTableModule, ProjectCharterDetailsComponent, ProjectDetailComponent],
})
export class ProjectCharterComponent implements OnInit {
  @Input({ required: true }) projectId: string = ''
  constructor(private projectOverviewService: ProjectOverviewService) {}

  ngOnInit() {
    console.log(this.projectId)
  }

  // Labels for phases
  phaseStateLabels = PhaseStateLabels

  // Method to get label (optional, directly use phaseStateLabels)
  getPhaseLabel(phase: PhaseState): string {
    return this.phaseStateLabels[phase]
  }
}
