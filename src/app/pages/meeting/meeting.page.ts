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
import { catchError, Subject, throwError } from 'rxjs'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'
import { MeetingListModel } from 'src/app/shared/models/meeting/meeting-list.model'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { MeetingService } from 'src/app/services/meeting.service'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { FilterBarComponent } from "../../layouts/filter-bar/filter-bar.component";

interface FilterOptions {
  milestoneId?: string;
  title? : string;
  fromDate?: Date;
  toDate?: Date;
  meetingStatus?: MeetingStatus;
  isDescending?: boolean;

}

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.page.html',
  styleUrls: ['./meeting.page.scss'],
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MeetingCalendarComponent,
    NzSwitchModule,
    MeetingTableComponent,
    MeetingFilterComponent, 
    FilterBarComponent],
})
export class MeetingPage implements OnInit {
  @ViewChild(MeetingFilterComponent) filterComponent!: MeetingFilterComponent;
  private destroy$ = new Subject<void>();

  listMeeting: SearchResponseModel<MeetingDetailModel> = {
    data: [],
    page: 1,
    size: 10,
    total: 0
  }
  meetings: MeetingDetailModel[] = [];

  filter: FilterOptions = {};
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

  isLoading = false;
  isLeader = false;
  isFetchAllMeetingLoading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute, 
    private viewMode: ViewModeConfigService,
    private meetingService: MeetingService,
    private notification: NzNotificationService) {
      this.activatedRoute.parent?.paramMap.subscribe((value) => {
        this.projectId = value.get('id')!;
        console.log(this.projectId)
      });
    }
  projectId = ''
  isTable = true
  isDesktopView = true

  

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  }
  ngOnInit(): void {
    this.filterMeetings();
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
  }

  filterMeetings(append: boolean = false) {
      this.isLoading = true;
      this.meetingService
        .getTableData(
          this.projectId,
          this.pageIndex,
          this.pageSize,
          this.filter.milestoneId,
          this.filter.title,
          this.filter.fromDate,
          this.filter.toDate,
          this.filter.meetingStatus,
          this.filter.isDescending
        )
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy danh sách hợp đồng thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(result => {
          // Update listContract with the new data
          this.listMeeting = {
            data: append ? [...this.listMeeting.data, ...result.data] : result.data,
            page: this.pageIndex,
            size: this.pageSize,
            total: result.total
          };
  
          // Update contracts from listContract data
          this.meetings = this.listMeeting.data;
          this.totalRecords = this.listMeeting.total;
          this.isLoading = false;
        });
    }
  
    get filterData() {
      return {
        ...this.filter,
        id: this.projectId
      };
    }
  
    onFilterApplied(filterResult: any) {
      this.filter = {...filterResult};
      this.pageIndex = 1;
      this.filterMeetings();
    }
  
    onFilterMenuOpened() {
      this.filterComponent.updateForm(this.filter);
    }
}
