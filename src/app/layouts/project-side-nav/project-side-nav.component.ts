import { CommonModule } from '@angular/common'
import { Component, Input, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ProjectSideNavItemComponent } from './project-side-nav-item/project-side-nav-item.component'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { filter, Subject, takeUntil } from 'rxjs'

@Component({
  selector: 'project-side-nav',
  standalone: true,
  imports: [MatSidenavModule, MatIconModule, ProjectSideNavItemComponent, RouterModule],
  templateUrl: './project-side-nav.component.html',
  styleUrl: './project-side-nav.component.css',
})
export class ProjectSideNavComponent implements OnInit {
  @Input() opened = true
  @Input() teamId: string | null = ''

  currentId = 0
  private destroy$ = new Subject<void>()

  constructor(private activatedRoute: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const parentRoute = this.activatedRoute.snapshot.firstChild
        if (parentRoute && parentRoute.params) {
          this.currentId = +parentRoute.params['id']
        }
      })
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
    { linkName: 'deals', iconName: 'request_quote_icon', linkText: 'Deals' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'recruitment-post', iconName: 'plagiarism_icon', linkText: 'Đăng Tuyển' },
  ]
}
