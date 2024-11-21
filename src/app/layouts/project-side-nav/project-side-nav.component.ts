import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { Subject, takeUntil } from 'rxjs'
import { AccountService } from '../../core/auth/account.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-project-side-nav',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatIconModule, RouterModule],
  templateUrl: './project-side-nav.component.html',
  styleUrl: './project-side-nav.component.css',
})
export class ProjectSideNavComponent implements OnInit, OnDestroy {
  @Input() opened = true;
  @Input() currentId = '';

  isUser = false;
  private destroy$ = new Subject<void>();

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.account$
      .pipe(takeUntil(this.destroy$))
      .subscribe(account => {
        this.isUser = account?.authorities.includes('User') ?? false;
      });
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  sideNavToggle() {
    this.opened = !this.opened
  }

  userSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'dashboard', iconName: 'dashboard', linkText: 'Dashboard' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'milestones', iconName: 'flag_icon', linkText: 'Cột Mốc' },
    { linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' },
    { linkName: 'transactions', iconName: 'savings_icon', linkText: 'Chi tiêu' },
    { linkName: 'assets', iconName: 'inventory_icon', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu_icon', linkText: 'Hợp Đồng' },
    { linkName: 'disbursements', iconName: 'local_atm_icon', linkText: 'Giải Ngân' },
    { linkName: 'equity', iconName: 'equalizer_icon', linkText: 'Cổ Phần' },
    { linkName: 'deals', iconName: 'request_quote_icon', linkText: 'Deals' },
    { linkName: 'calendar', iconName: 'insert_invitation_icon', linkText: 'Lịch Hẹn' },
    { linkName: 'documents', iconName: 'folder_icon', linkText: 'Tài Liệu' },
    { linkName: 'recruitment-post', iconName: 'plagiarism_icon', linkText: 'Đăng Tuyển' },
  ]

  investorSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'dashboard', iconName: 'dashboard', linkText: 'Dashboard' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'milestones', iconName: 'flag_icon', linkText: 'Cột Mốc' },
    { linkName: 'transactions', iconName: 'savings_icon', linkText: 'Chi tiêu' },
    { linkName: 'assets', iconName: 'inventory_icon', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu_icon', linkText: 'Hợp Đồng' },
    { linkName: 'investor-disbursements', iconName: 'local_atm_icon', linkText: 'Giải Ngân' },
    { linkName: 'equity', iconName: 'equalizer_icon', linkText: 'Cổ Phần' },
    { linkName: 'calendar', iconName: 'insert_invitation_icon', linkText: 'Lịch Hẹn' },
    { linkName: 'documents', iconName: 'folder_icon', linkText: 'Tài Liệu' },
  ];
}
