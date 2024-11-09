import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { ProjectSideNavItemComponent } from './project-side-nav-item/project-side-nav-item.component'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { Subject } from 'rxjs'

@Component({
  selector: 'project-side-nav',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, ProjectSideNavItemComponent, RouterModule],
  templateUrl: './project-side-nav.component.html',
  styleUrl: './project-side-nav.component.css',
})
export class ProjectSideNavComponent implements OnInit, OnDestroy {
  @Input() opened = true
  @Input() currentId = ''

  private destroy$ = new Subject<void>()

  constructor() {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  sideNavToggle() {
    this.opened = !this.opened
  }

  sideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'finance', iconName: 'savings_icon', linkText: 'Chi tiêu' },
    { linkName: 'assets', iconName: 'inventory_icon', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu_icon', linkText: 'Hợp Đồng' },
    { linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' },
    { linkName: 'milestones', iconName: 'flag_icon', linkText: 'Cột Mốc' },
    { linkName: 'disbursements', iconName: 'local_atm_icon', linkText: 'Giải Ngân' },
    { linkName: 'calendar', iconName: 'insert_invitation_icon', linkText: 'Lịch Hẹn' },
    { linkName: 'documents', iconName: 'folder_icon', linkText: 'Tài Liệu' },
    { linkName: 'equity', iconName: 'equalizer_icon', linkText: 'Cổ Phần' },
    { linkName: 'project-deal-list', iconName: 'request_quote_icon', linkText: 'Deals' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'recruitment-post', iconName: 'plagiarism_icon', linkText: 'Đăng Tuyển' },
  ]
}
