import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component'
import { ActivatedRoute } from '@angular/router'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { MeetingCalendarComponent } from 'src/app/components/meeting-page/meeting-calendar/meeting-calendar.component'
import { NzSwitchModule } from 'ng-zorro-antd/switch'
import { FormsModule } from '@angular/forms'
import { MeetingTableComponent } from 'src/app/components/meeting-page/meeting-table/meeting-table.component'
import { MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { MeetingFilterComponent } from 'src/app/components/meeting-page/meeting-filter/meeting-filter.component'
import { Subject } from 'rxjs'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { FilterBarComponent } from '../../layouts/filter-bar/filter-bar.component'

interface FilterOptions {
  milestoneId?: string
  title?: string
  fromDate?: Date
  toDate?: Date
  meetingStatus?: MeetingStatus
  isDescending?: boolean
}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.page.html',
  styleUrls: ['./meeting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, MeetingCalendarComponent, NzSwitchModule, MeetingTableComponent, MeetingFilterComponent, FilterBarComponent],
})
export class MeetingPage implements OnInit {
  @ViewChild(MeetingFilterComponent) filterComponent!: MeetingFilterComponent
  private destroy$ = new Subject<void>()

  listMeeting: SearchResponseModel<MeetingDetailModel> = {
    data: [],
    page: 1,
    size: 10,
    total: 0,
  }
  meetings: MeetingDetailModel[] = []
  meetingId: string = ''

  filter: FilterOptions = {}
  pageIndex: number = 1
  pageSize: number = 20
  totalRecords: number = 200

  isLoading = false
  isLeader = false
  isFetchAllMeetingLoading: boolean = false

  projectId = ''
  isTable = true
  isDesktopView = true

  constructor(private activatedRoute: ActivatedRoute, private viewMode: ViewModeConfigService) {
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    //get meeting id
    this.meetingId = this.activatedRoute.snapshot.paramMap.get('meetingId') ?? ''
    console.log(this.meetingId)
  }

  ngOnInit(): void {
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
  }

  get filterData() {
    return {
      ...this.filter,
      id: this.projectId,
    }
  }

  onFilterApplied(filterResult: any) {
    this.filter = { ...filterResult }
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter)
  }
}
