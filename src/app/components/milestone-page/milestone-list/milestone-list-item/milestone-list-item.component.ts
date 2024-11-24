import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'

@Component({
  selector: 'app-milestone-list-item',
  templateUrl: './milestone-list-item.component.html',
  styleUrls: ['./milestone-list-item.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, NzProgressModule]
})
export class MilestoneListItemComponent {
  @Input({ required: true }) milestone: Milestone | null = null

  constructor() {}
}
