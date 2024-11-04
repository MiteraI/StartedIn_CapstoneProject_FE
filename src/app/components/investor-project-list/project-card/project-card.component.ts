import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InvestorProjectListItemModel } from 'src/app/shared/models/project/investor-project-list-item.model';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { IonIcon } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons';
import { cashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, NzAvatarModule, InitialsOnlyPipe, IonIcon],
  templateUrl: 'project-card.component.html',
  styleUrls: ['project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {
  @Input({ required: true }) project!: InvestorProjectListItemModel;

  ngOnInit() {
    addIcons({cashOutline});
  }
}
