import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-fail',
  templateUrl: './payment-fail.page.html',
  styleUrls: ['./payment-fail.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
  ],
})
export class PaymentFailPage {
  constructor(private router: Router) {}

  return() {
    this.router.navigate(['']);
  }
}
