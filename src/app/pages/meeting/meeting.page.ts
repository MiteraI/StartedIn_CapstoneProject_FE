import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component'
import { ActivatedRoute } from '@angular/router'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { MeetingCalendarComponent } from 'src/app/components/meeting-page/meeting-calendar/meeting-calendar.component'
import { NzSwitchModule } from 'ng-zorro-antd/switch'
import { FormsModule } from '@angular/forms'
import { MeetingTableComponent } from 'src/app/components/meeting-page/meeting-table/meeting-table.component'

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.page.html',
  styleUrls: ['./meeting.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ViewTitleBarComponent, MeetingCalendarComponent, NzSwitchModule, MeetingTableComponent],
})
export class MeetingPage implements OnInit {
  constructor(private activatedRoute: ActivatedRoute, private viewMode: ViewModeConfigService) {}
  projectId = ''
  isTable = true
  isDesktopView = true

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()
  }
  ngOnInit(): void {
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })

    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
  }
}
