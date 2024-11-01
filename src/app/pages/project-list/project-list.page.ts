import { Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { RouterModule } from '@angular/router'
import { ProjectSideNavComponent } from 'src/app/layouts/project-side-nav/project-side-nav.component'
import { IonRouterOutlet } from '@ionic/angular/standalone'

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.page.html',
  styleUrls: ['./project-list.page.scss'],
  standalone: true,
  imports: [IonContent, RouterModule],
})
export class ProjectListPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
