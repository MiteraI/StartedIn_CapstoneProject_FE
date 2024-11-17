import { Component, Input, OnInit } from '@angular/core'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'

@Component({
  selector: 'app-milestone-list',
  templateUrl: './milestone-list.component.html',
  styleUrls: ['./milestone-list.component.scss'],
  standalone: true,
  imports: [],
})
export class MilestoneListComponent implements OnInit {
  @Input({ required: true }) milestoneList: Milestone[] = []
  @Input({ required: true }) projectId: string = ''
  @Input({ required: true }) isFetchAllTaskLoading: boolean = false
  @Input() total: number = 0
  @Input() size: number = 10
  @Input() page: number = 1

  constructor() {}

  ngOnInit() {}
}
