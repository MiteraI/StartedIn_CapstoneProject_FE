import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { CreateProjectCharterFormComponent } from 'src/app/components/project-charter/create-project-charter-form/create-project-charter-form.component';

@Component({
  selector: 'app-create-project-charter',
  templateUrl: './create-project-charter.page.html',
  styleUrls: ['./create-project-charter.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    CreateProjectCharterFormComponent,
  ],
})
export class CreateProjectCharterPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
