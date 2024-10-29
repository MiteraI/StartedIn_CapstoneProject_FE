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
import { DataTablePreviewComponent } from 'src/app/components/table/table.component';
import { ButtonPreviewComponent } from 'src/app/components/button/button.component';
import { HlmCheckboxComponent } from '@spartan-ng/ui-checkbox-helm';
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
    DataTablePreviewComponent,
    ButtonPreviewComponent,
    HlmCheckboxComponent,
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
