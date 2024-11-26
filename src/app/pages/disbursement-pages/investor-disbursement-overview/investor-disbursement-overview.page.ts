import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-investor-disbursement-overview',
  templateUrl: './investor-disbursement-overview.page.html',
  styleUrls: ['./investor-disbursement-overview.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InvestorDisbursementOverviewPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
