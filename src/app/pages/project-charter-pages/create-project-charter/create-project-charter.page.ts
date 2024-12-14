import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ProjectCharterDetailsComponent } from '../../../components/project-charter/project-charter-details/project-charter-details.component'
import { ProjectDetailComponent } from 'src/app/components/project-charter/project-detail/project-detail.component'
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component'

@Component({
  selector: 'app-create-project-charter',
  templateUrl: './create-project-charter.page.html',
  styleUrls: ['./create-project-charter.page.scss'],
  standalone: true,
  imports: [ProjectCharterDetailsComponent, ProjectDetailComponent, ViewTitleBarComponent],
})
export class CreateProjectCharterPage implements OnInit {
  projectId = ''
  constructor(private activeRoute: ActivatedRoute) {}
  ngOnInit(): void {
    this.projectId = this.activeRoute.parent?.snapshot.paramMap.get('id')!
  }
}
