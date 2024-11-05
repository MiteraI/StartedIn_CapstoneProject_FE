import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-investor-deal-offer-list',
  templateUrl: './investor-deal-offer-list.page.html',
  styleUrls: ['./investor-deal-offer-list.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InvestorDealOfferListPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
