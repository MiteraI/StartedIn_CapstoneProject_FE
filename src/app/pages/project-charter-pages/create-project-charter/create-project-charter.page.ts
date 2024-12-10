import { Component } from '@angular/core';
import { CreateProjectCharterFormComponent } from 'src/app/components/project-charter/create-project-charter-form/create-project-charter-form.component';

@Component({
  selector: 'app-create-project-charter',
  templateUrl: './create-project-charter.page.html',
  styleUrls: ['./create-project-charter.page.scss'],
  standalone: true,
  imports: [
    CreateProjectCharterFormComponent
  ],
})
export class CreateProjectCharterPage {
  constructor() {}
}
