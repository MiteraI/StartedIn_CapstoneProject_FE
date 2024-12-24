import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzModalService } from 'ng-zorro-antd/modal'
import { NzTableModule } from 'ng-zorro-antd/table'
import { MeetingCreateModalComponent } from '../meeting-create-modal/meeting-create-modal.component'
import { MatIconModule } from '@angular/material/icon'
import { ViewMeetingNotesModalComponent } from '../view-meeting-notes-modal/view-meeting-notes-modal.component'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingDetailModel } from 'src/app/shared/models/meeting/meeting-detail.model'
import { MeetingLabel, MeetingStatus } from 'src/app/shared/enums/meeting-status.enum'
import { MeetingDetailModalComponent } from '../meeting-detail-modal/meeting-detail-modal.component'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message'
import { SearchResponseModel } from 'src/app/shared/models/search-response.model'
import { catchError, throwError } from 'rxjs'
import { format } from 'date-fns'

@Component({
  selector: 'app-meeting-table',
  templateUrl: './meeting-table.component.html',
  styleUrls: ['./meeting-table.component.scss'],
  standalone: true,
  imports: [NzTableModule, NzButtonModule, MatIconModule, NzToolTipModule, NzTagModule, NzMessageModule],
})
export class MeetingTableComponent implements OnInit, OnChanges {
  @Input({ required: true }) projectId = ''
  @Input({ required: true }) filterResult: FilterOptions = {}
  @Input() meetingId: string = ''

  listMeeting: SearchResponseModel<MeetingDetailModel> = {
    data: [],
    page: 1,
    size: 5,
    total: 0,
  }

  readonly MeetingLabel = MeetingLabel

  isLoading = false

  constructor(private modalService: NzModalService, private meetingService: MeetingService, private messageService: NzMessageService) {}
  ngOnChanges(changes: SimpleChanges): void {
    // If filterResult changes, filter meetings
    if (changes['filterResult'] && !changes['filterResult'].firstChange) {
      const previousValue = changes['filterResult'].previousValue
      const currentValue = changes['filterResult'].currentValue

      if (JSON.stringify(previousValue) !== JSON.stringify(currentValue)) {
        this.filterMeetings()
      }
    }
  }

  ngOnInit() {
    // subsribe to refresh table data
    this.meetingService.refreshMeeting$.subscribe(() => {
      this.getTableData()
    })

    if (this.meetingId != '') {
      this.meetingService.getMeetingDetails(this.projectId, this.meetingId).subscribe({
        next: (meetingDetail) => {
          this.openMeetingDetail(meetingDetail)
        },
        error: (error) => {
          console.error('Error:', error)
        },
      })
    }
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy - HH:mm')
  }

  private getTableData() {
    this.isLoading = true
    this.meetingService.getTableData(this.projectId, this.listMeeting.page, this.listMeeting.size).subscribe({
      next: (data) => {
        this.listMeeting.data = data.data
        this.listMeeting.total = data.total
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error:', error)
        this.isLoading = false
      },
    })
  }

  openCreateMeetingModal() {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: MeetingCreateModalComponent,
      nzData: {
        projectId: this.projectId,
        appendMode: false,
        appointmentTime: new Date().toISOString(),
      },
      nzFooter: null,
      nzWidth: '700px',
    })
  }

  openMeetingDetail(meetingDetail: MeetingDetailModel) {
    const modalRef = this.modalService.create({
      nzTitle: 'Chi Tiết Cuộc Họp',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzData: { meetingId: meetingDetail.id, projectId: this.projectId },
      nzContent: MeetingDetailModalComponent,
      nzFooter: null,
      nzWidth: '70%',
    })
  }

  onPageIndexChange(newPage: number): void {
    this.listMeeting.page = newPage
    this.getTableData()
  }

  getStatusColor(status: MeetingStatus): string {
    switch (status) {
      case MeetingStatus.PROPOSED:
        return 'blue'
      case MeetingStatus.ONGOING:
        return 'gold'
      case MeetingStatus.FINISHED:
        return 'green'
      case MeetingStatus.CANCELLED:
        return 'red'
      default:
        return 'default'
    }
  }

  openCancelMeetingModal(meetingDetail: MeetingDetailModel) {
    const modalRef = this.modalService.confirm({
      nzTitle: 'Xác nhận',
      nzContent: 'Bạn có chắc chắn muốn hủy cuộc họp này?',
      nzOkText: 'Tạo',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.cancelMeeting(meetingDetail)
      },
    })
  }

  cancelMeeting(meetingDetail: MeetingDetailModel) {
    this.meetingService.cancelMeeting(this.projectId, meetingDetail.id).subscribe({
      next: () => {
        this.meetingService.refreshMeeting$.next(true)
        this.messageService.success('Hủy cuộc họp thành công')
      },
      error: (error) => {
        console.error('Error:', error)
        this.messageService.error(error.error)
      },
    })
  }

  filterMeetings(append: boolean = false) {
    this.isLoading = true
    this.meetingService
      .getTableData(
        this.projectId,
        this.listMeeting.page,
        this.listMeeting.size,
        this.filterResult.milestoneId,
        this.filterResult.title,
        this.filterResult.fromDate,
        this.filterResult.toDate,
        this.filterResult.meetingStatus,
        this.filterResult.isDescending
      )
      .pipe(
        catchError((error) => {
          this.messageService.error('Lấy danh sách hợp đồng thất bại!')
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((result) => {
        // Update listContract with the new data
        this.listMeeting = {
          data: append ? [...this.listMeeting.data, ...result.data] : result.data,
          page: this.listMeeting.page,
          size: this.listMeeting.size,
          total: result.total,
        }
        this.listMeeting.data = this.listMeeting.data
        this.listMeeting.total = this.listMeeting.total
        this.isLoading = false
      })
  }
}

interface FilterOptions {
  milestoneId?: string
  title?: string
  fromDate?: Date
  toDate?: Date
  meetingStatus?: MeetingStatus
  isDescending?: boolean
}
