import { Component, Input, OnInit } from '@angular/core'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { NzTableModule } from 'ng-zorro-antd/table'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { ProjectGeneralInformationModel } from 'src/app/shared/models/project/project-general-info.model'
import { TeamRoleLabels, TeamRole } from 'src/app/shared/enums/team-role.enum'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { CommonModule } from '@angular/common'
import { NzIconModule } from 'ng-zorro-antd/icon'

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],
  standalone: true,
  imports: [NzCollapseModule, NzTableModule, NzSkeletonModule, CommonModule, NzIconModule],
})
export class ProjectDetailComponent implements OnInit {
  projectGeneralInfo: ProjectGeneralInformationModel | undefined
  teamRoleLabels = TeamRoleLabels
  loading: boolean = true

  @Input({ required: true }) projectId: string = ''
  constructor(private projectCharterService: ProjectCharterService) {}

  ngOnInit() {
    this.fetchProjectGeneralInfo()
  }

  fetchProjectGeneralInfo() {
    this.loading = true
    this.projectCharterService.getProjectGeneralInfo(this.projectId).subscribe({
      next: (res) => {
        this.projectGeneralInfo = res
        console.log(this.projectGeneralInfo)
        this.loading = false
      },
      error: (err) => {
        console.log(err)
        this.loading = false
      },
    })
  }
}
