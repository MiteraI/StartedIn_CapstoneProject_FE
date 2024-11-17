import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'

@Component({
  selector: 'app-milestone-table',
  templateUrl: './milestone-table.component.html',
  styleUrls: ['./milestone-table.component.scss'],
  standalone: true,
  imports: [],
})
export class MilestoneTableComponent implements OnInit {
  @Output() pageChanged = new EventEmitter<number>()
  @Input({ required: true }) milestoneList: Milestone[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1
  
  constructor() {}

  ngOnInit() {}
}
