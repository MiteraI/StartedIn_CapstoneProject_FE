import { Component, OnInit } from '@angular/core'
import { IonContent } from '@ionic/angular/standalone'
import { RouterModule } from '@angular/router'

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
