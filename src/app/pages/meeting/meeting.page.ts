import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NzCalendarModule } from 'ng-zorro-antd/calendar'
import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { TitleBarComponent } from 'src/app/layouts/title-bar/title-bar.component'

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.page.html',
  styleUrls: ['./meeting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzCalendarModule, NzBadgeModule, TitleBarComponent],
})
export class MeetingPage {
  current = new Date()
  tomorrow = new Date()
  yesterday = new Date()
  nextMonth = new Date()

  constructor() {
    this.tomorrow.setDate(this.tomorrow.getDate() + 1)
    this.yesterday.setDate(this.yesterday.getDate() - 1)
    this.nextMonth.setMonth(this.nextMonth.getMonth() + 1)
    // Ignore time
    this.current.setHours(0, 0, 0, 0)
    this.tomorrow.setHours(0, 0, 0, 0)
    this.yesterday.setHours(0, 0, 0, 0)
    this.nextMonth.setHours(0, 0, 0, 0)
  }

  objects = [
    {
      type: 'warning',
      content: 'This is warning event',
      title: 'This is title to warning event',
      date: this.tomorrow,
    },
    {
      type: 'success',
      content: 'This is very long usual event with very very long decription...',
      title: 'This is title to event with long description',
      date: this.current,
    },
    {
      type: 'error',
      content: 'This is error event',
      title: 'This is title to error event',
      date: this.yesterday,
    },
    {
      type: 'default',
      content: 'This is default event',
      title: 'This is title to default event',
      date: this.nextMonth,
    },
  ]

  getEvents(event: any) {
    return event
  }

  getMonthEvents(month: Date) {
    return this.objects.filter((value) => {
      return value.date.getMonth() === month.getMonth()
    })
  }
}
