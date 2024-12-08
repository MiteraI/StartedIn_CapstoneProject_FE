import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzCalendarModule } from 'ng-zorro-antd/calendar'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { TitleBarComponent } from 'src/app/layouts/title-bar/title-bar.component'
import { MeetingListModel } from 'src/app/shared/models/meeting/meeting-list.model'
import { MeetingService } from 'src/app/services/meeting.service'
import { ActivatedRoute } from '@angular/router'
import { NzModalService } from 'ng-zorro-antd/modal'
import { MeetingDetailModalComponent } from 'src/app/components/meeting-page/meeting-detail-modal/meeting-detail-modal.component'
import { MeetingCreateModalComponent } from 'src/app/components/meeting-page/meeting-create-modal/meeting-create-modal.component'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.page.html',
  styleUrls: ['./meeting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzCalendarModule, NzBadgeModule, TitleBarComponent],
})
export class MeetingPage implements OnInit, OnDestroy {
  constructor(private meetingService: MeetingService, private activatedRoute: ActivatedRoute, private modalService: NzModalService) {}
  private subscription: Subscription = new Subscription()
  meetingList: MeetingListModel[] | undefined
  projectId = ''
  year = new Date().getFullYear()
  selectedDate: Date = new Date()

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  }
  ngOnInit(): void {
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    //detect changes by using refeshProject$ observable
    this.subscription.add(
      this.meetingService.refreshMeeting$.subscribe((refresh) => {
        if (refresh) {
          this.fetchYearEvents(this.year) // Fetch updated meeting data
        }
      })
    )
  }

  onSelectChange(date: Date): void {
    const selectedYear = date.getFullYear()
    if (selectedYear !== this.year) {
      this.fetchYearEvents(selectedYear)
    }
    this.openCreateMeetingModal()
  }

  openCreateMeetingModal() {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: MeetingCreateModalComponent,
      nzTitle: 'Tạo Cuộc Họp',
      nzData: {
        projectId: this.projectId,
        appointmentTime: this.selectedDate,
      },
      nzFooter: null,
    })
  }

  openMeetingDetailModal(meetingId: string) {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: MeetingDetailModalComponent,
      nzData: {
        meetingId: meetingId,
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  onBadgeClick(meetingId: string, event: MouseEvent): void {
    event.stopPropagation()
    this.openMeetingDetailModal(meetingId)
  }

  fetchYearEvents(year: number) {
    this.meetingService.getMeetingsForCalendar(this.projectId, year).subscribe({
      next: (response) => {
        this.meetingList = (response as MeetingListModel[]).map((meeting) => ({
          ...meeting,
          appointmentTime: new Date(meeting.appointmentTime), // Convert to Date object
        }))
        this.year = year
      },
      error: (error) => {
        console.error('Error:', error)
      },
    })
  }
  getEvents(event: any) {
    return event
  }

  getMonthEvents(month: Date) {
    return this.meetingList!.filter((event) => {
      const eventDate = event.appointmentTime
      return eventDate.getFullYear() === month.getFullYear() && eventDate.getMonth() === month.getMonth()
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }
}
