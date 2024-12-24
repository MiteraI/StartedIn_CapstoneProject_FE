import { CommonModule } from '@angular/common'
import { Component, ContentChild, EventEmitter, Input, Output, OnInit, TemplateRef } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'

@Component({
  selector: 'app-history-sidebar',
  templateUrl: './history-sidebar.component.html',
  styleUrls: ['./history-sidebar.component.scss'],
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, CommonModule],
})
export class HistorySidebarComponent implements OnInit {
  @Input() historyName: string = 'Lịch Sử'
  @Input() isCollapsed: boolean = false
  @Output() isCollapsedEmit = new EventEmitter<boolean>()

  isDesktopView: boolean = true

  @ContentChild('mainContent') mainContent!: TemplateRef<any>
  @ContentChild('drawerContent') drawerContent!: TemplateRef<any>

  constructor(private viewMode: ViewModeConfigService) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.subscribe((val) => (this.isDesktopView = val))
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed
    this.isCollapsedEmit.emit(this.isCollapsed)
  }
}
