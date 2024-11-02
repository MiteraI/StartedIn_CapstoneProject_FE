import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { CreateInvestmentContractFormComponent } from 'src/app/components/contract-pages/create-investment-contract-form/create-investment-contract-form.component';
import { NzModalModule } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-create-investment-contract',
  templateUrl: './create-investment-contract.page.html',
  styleUrls: ['./create-investment-contract.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, NzModalModule, CreateInvestmentContractFormComponent]
})
export class CreateInvestmentContractPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
