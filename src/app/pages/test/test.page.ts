import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { DataTablePreviewComponent } from 'src/app/components/table/table.component';
import { ButtonPreviewComponent } from 'src/app/components/button/button.component';
import { HlmCheckboxComponent } from '@spartan-ng/ui-checkbox-helm';


@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, DataTablePreviewComponent, ButtonPreviewComponent, HlmCheckboxComponent]
})
export class TestPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
