import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { filter, Subject, takeUntil } from 'rxjs'
import { AccountService } from '../../core/auth/account.service'
import { CommonModule } from '@angular/common'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'

@Component({
  selector: 'app-project-side-nav',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatIconModule, RouterModule],
  templateUrl: './project-side-nav.component.html',
  styleUrl: './project-side-nav.component.css',
})
export class ProjectSideNavComponent implements OnInit, OnDestroy {
  @Input() opened = true
  @Input() currentId = ''

  role: TeamRole | null = null
  teamRole = TeamRole
  private destroy$ = new Subject<void>()

  constructor(private accountService: AccountService, private roleService: RoleInTeamService) {}

  ngOnInit(): void {
    this.roleService.role$
      .pipe(
        takeUntil(this.destroy$),
        filter((role) => role !== null)
      )
      .subscribe((role) => {
        this.role = role!.roleInTeam
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  sideNavToggle() {
    this.opened = !this.opened
  }

  sharedSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'dashboard', iconName: 'dashboard', linkText: 'Dashboard' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'milestones', iconName: 'flag_icon', linkText: 'Cột Mốc' },
    { linkName: 'transactions', iconName: 'savings_icon', linkText: 'Giao Dịch' },
    { linkName: 'assets', iconName: 'inventory_icon', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu_icon', linkText: 'Hợp Đồng' },
    { linkName: 'equity', iconName: 'equalizer_icon', linkText: 'Cổ Phần' },
    //{ linkName: 'calendar', iconName: 'insert_invitation_icon', linkText: 'Lịch Hẹn' },
    //{ linkName: 'documents', iconName: 'folder_icon', linkText: 'Tài Liệu' },
  ]

  leaderSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' },
    { linkName: 'disbursements', iconName: 'local_atm_icon', linkText: 'Giải Ngân' },
    { linkName: 'deals', iconName: 'request_quote_icon', linkText: 'Deals' },
    { linkName: 'payos', iconName: 'payment', linkText: 'PayOS' },
    { linkName: 'investment-call', iconName: 'paid', linkText: 'Gọi Vốn' },
    { linkName: 'recruitment-post', iconName: 'plagiarism_icon', linkText: 'Đăng Tuyển' },
  ]

  memberSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [{ linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' }]

  investorSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [{ linkName: 'investor-disbursements', iconName: 'local_atm_icon', linkText: 'Giải Ngân' }]
}
