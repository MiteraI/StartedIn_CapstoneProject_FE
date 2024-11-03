import { Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { ProjectSideNavComponent } from 'src/app/layouts/project-side-nav/project-side-nav.component'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { RouterOutlet } from '@angular/router'

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.page.html',
  styleUrls: ['./project-details.page.scss'],
  standalone: true,
  imports: [IonContent, ProjectSideNavComponent, RouterOutlet],
})
export class ProjectDetailsPage implements OnInit {
  isDesktopView: boolean = false

  constructor(private viewMode: ViewModeConfigService) {}

  ngOnInit(): void {
    this.viewMode.isDesktopView$.subscribe((val) => (this.isDesktopView = val))
  }
}
