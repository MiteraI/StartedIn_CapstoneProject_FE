import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { DateDisplayPipe } from 'src/app/shared/pipes/date-display.pipe'

@Component({
  selector: 'app-milestone-list-item',
  templateUrl: './milestone-list-item.component.html',
  styleUrls: ['./milestone-list-item.component.scss'],
  standalone: true,
  imports: [DateDisplayPipe, CommonModule, MatIconModule, NzProgressModule]
})
export class MilestoneListItemComponent implements OnInit {
  @Input({ required: true }) milestone: Milestone | null = null

  constructor() {}

  ngOnInit() {}
}
