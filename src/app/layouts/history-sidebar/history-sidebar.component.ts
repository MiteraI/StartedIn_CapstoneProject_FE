import { CommonModule } from '@angular/common'
import { Component, ContentChild, EventEmitter, Input, Output, OnInit, TemplateRef } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { LargeViewportConfigService } from 'src/app/core/config/large-viewport-config.service'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ScrollService } from 'src/app/core/util/scroll.service'

@Component({
  selector: 'app-history-sidebar',
  templateUrl: './history-sidebar.component.html',
  styleUrls: ['./history-sidebar.component.scss'],
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, CommonModule],
})
export class HistorySidebarComponent implements OnInit {
  @Input() historyName: string = 'Lịch sử'
  @Input() isCollapsed: boolean = false
  @Output() isCollapsedEmit = new EventEmitter<boolean>()

  isLargeViewport: boolean = true

  @ContentChild('mainContent') mainContent!: TemplateRef<any>
  @ContentChild('drawerContent') drawerContent!: TemplateRef<any>

  constructor(private viewMode: LargeViewportConfigService, private scrollService: ScrollService) {}

  ngOnInit() {
    this.viewMode.isLargeViewport$.subscribe((val) => (this.isLargeViewport = val))
  }

  onScroll(event: any) {
    const element = event.target
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.scrollService.emitScroll()
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed
    this.isCollapsedEmit.emit(this.isCollapsed)
  }
}
