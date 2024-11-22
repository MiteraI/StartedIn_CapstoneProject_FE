import { Component, OnInit } from '@angular/core';
import { CreateProjectCharterFormComponent } from 'src/app/components/project-charter/create-project-charter-form/create-project-charter-form.component';
import { TitleBarComponent } from 'src/app/layouts/title-bar/title-bar.component';

@Component({
  selector: 'app-create-project-charter',
  templateUrl: './create-project-charter.page.html',
  styleUrls: ['./create-project-charter.page.scss'],
  standalone: true,
  imports: [
    CreateProjectCharterFormComponent,
    TitleBarComponent
  ],
})
export class CreateProjectCharterPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
