import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectOverviewService } from 'src/app/services/project-overview.service';
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model';
import { PhaseState } from 'src/app/shared/enums/phase-status.enum';
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum';

@Component({
  selector: 'app-project-charter',
  templateUrl: './project-charter.component.html',
  styleUrls: ['./project-charter.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ProjectCharterComponent implements OnInit {
  projectOverview: ProjectOveriewModel | undefined
  constructor(private projectOverviewService: ProjectOverviewService) {}

  ngOnInit() {
    this.projectOverviewService.projectOverview$.subscribe((data) => {
      this.projectOverview = data
    })
  }

  // Labels for phases
  phaseStateLabels = PhaseStateLabels

  // Method to get label (optional, directly use phaseStateLabels)
  getPhaseLabel(phase: PhaseState): string {
    return this.phaseStateLabels[phase]
  }
}
