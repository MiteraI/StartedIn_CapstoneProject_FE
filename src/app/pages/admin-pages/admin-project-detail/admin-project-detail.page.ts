import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-admin-project-detail',
  templateUrl: './admin-project-detail.page.html',
  styleUrls: ['./admin-project-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class AdminProjectDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
