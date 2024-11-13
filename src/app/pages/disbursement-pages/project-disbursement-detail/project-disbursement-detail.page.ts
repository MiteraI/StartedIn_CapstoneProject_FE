import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-project-disbursement-detail',
  templateUrl: './project-disbursement-detail.page.html',
  styleUrls: ['./project-disbursement-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProjectDisbursementDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
