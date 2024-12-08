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
    { linkName: 'charter', iconName: 'info', linkText: 'Tuyên ngôn' },
    { linkName: 'milestones', iconName: 'flag', linkText: 'Cột Mốc' },
    { linkName: 'transactions', iconName: 'swap_horiz', linkText: 'Giao Dịch' },
    { linkName: 'assets', iconName: 'inventory', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu', linkText: 'Hợp Đồng' },
    { linkName: 'equity', iconName: 'equalizer', linkText: 'Cổ Phần' },
    { linkName: 'meeting', iconName: 'insert_invitation', linkText: 'Lịch Hẹn' },
    //{ linkName: 'documents', iconName: 'folder', linkText: 'Tài Liệu' },
  ]

  leaderSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [
    { linkName: 'tasks', iconName: 'assignment', linkText: 'Tác Vụ' },
    { linkName: 'disbursements', iconName: 'account_balance', linkText: 'Giải Ngân' },
    { linkName: 'investment-call', iconName: 'local_atm', linkText: 'Gọi Vốn' },
    //{ linkName: 'deals', iconName: 'handshake', linkText: 'Deals' },
    { linkName: 'payos', iconName: 'payment', linkText: 'PayOS' },
    { linkName: 'recruitment-post', iconName: 'plagiarism', linkText: 'Đăng Tuyển' },
  ]

  memberSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [{ linkName: 'tasks', iconName: 'assignment', linkText: 'Tác Vụ' }]

  investorSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
  }[] = [{ linkName: 'investor-disbursements', iconName: 'account_balance', linkText: 'Giải Ngân' }]
}
