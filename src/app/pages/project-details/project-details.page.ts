import { Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { ProjectSideNavComponent } from 'src/app/layouts/project-side-nav/project-side-nav.component'
import { IonRouterOutlet } from '@ionic/angular/standalone'
import { MatSidenavModule } from '@angular/material/sidenav'
import { Platform } from '@ionic/angular'

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.page.html',
  styleUrls: ['./project-details.page.scss'],
  standalone: true,
  imports: [IonContent, ProjectSideNavComponent, IonRouterOutlet],
})
export class ProjectDetailsPage implements OnInit {
  isDesktopView: boolean = false

  constructor(private platform: Platform) {}

  ngOnInit() {
    this.isDesktopView = this.platform.is('desktop')
  }
}
