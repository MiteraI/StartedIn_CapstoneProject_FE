import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-investor-disbursement-detail',
  templateUrl: './investor-disbursement-detail.page.html',
  styleUrls: ['./investor-disbursement-detail.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InvestorDisbursementDetailPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
