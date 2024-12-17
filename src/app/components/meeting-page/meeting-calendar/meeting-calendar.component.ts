import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NzCalendarModule } from 'ng-zorro-antd/calendar'
import { NzModalService } from 'ng-zorro-antd/modal'
import { Subscription } from 'rxjs'
import { MeetingService } from 'src/app/services/meeting.service'
import { MeetingListModel } from 'src/app/shared/models/meeting/meeting-list.model'
import { MeetingCreateModalComponent } from '../meeting-create-modal/meeting-create-modal.component'
import { MeetingDetailModalComponent } from '../meeting-detail-modal/meeting-detail-modal.component'

@Component({
  selector: 'app-meeting-calendar',
  templateUrl: './meeting-calendar.component.html',
  styleUrls: ['./meeting-calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, NzCalendarModule, FormsModule],
})
export class MeetingCalendarComponent implements OnInit, OnDestroy {
  meetingList: MeetingListModel[] | undefined
  @Input({ required: true }) projectId = ''
  year = new Date().getFullYear()
  selectedDate: Date = new Date()

  constructor(private modalService: NzModalService, private meetingService: MeetingService) {}

  private subscription: Subscription = new Subscription()

  ngOnInit() {
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
      nzData: {
        projectId: this.projectId,
        appendMode: false,
        appointmentTime: this.selectedDate,
      },
      nzFooter: null,
      nzWidth: '700px',
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
      nzWidth: '70%',
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
  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  }
}
