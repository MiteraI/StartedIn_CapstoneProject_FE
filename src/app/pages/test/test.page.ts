import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonMenu,
  IonMenuButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar, IonButtons, IonFooter, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  standalone: true,
  imports: [IonSegment, IonFooter, IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonMenu,
    IonMenuButton,
    IonSegmentButton,
    IonLabel,
    RouterModule
  ],
})
export class TestPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
