import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-project-disbursement-list',
  templateUrl: './project-disbursement-list.page.html',
  styleUrls: ['./project-disbursement-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProjectDisbursementListPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
