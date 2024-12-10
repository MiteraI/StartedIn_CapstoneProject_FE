import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'
import { filter, Subject, takeUntil } from 'rxjs'
import { CommonModule } from '@angular/common'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { link } from 'ionicons/icons'

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
  showCall: boolean = false;
  teamRole = TeamRole
  private destroy$ = new Subject<void>()

  constructor(private roleService: RoleInTeamService) {}

  ngOnInit(): void {
    this.roleService.role$
      .pipe(
        takeUntil(this.destroy$),
        filter((role) => role !== null)
      )
      .subscribe((role) => {
        this.role = role!.roleInTeam
        this.showLinksForRole(role!.roleInTeam)
      })
  }

  showLinksForRole(role: TeamRole) {
    if (role === TeamRole.LEADER) {
      this.projectSideNavLinks.find(link => link.linkName === 'tasks')!.hide = false;
      this.contractSideNavLinks.find(link => link.linkName === 'disbursements')!.hide = false;
      this.showCall = true;
    } else if (role === TeamRole.INVESTOR) {
      this.contractSideNavLinks.find(link => link.linkName === 'investor-disbursements')!.hide = false;
    } else {
      this.projectSideNavLinks.find(link => link.linkName === 'tasks')!.hide = false;
    }
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  sideNavToggle() {
    this.opened = !this.opened
  }

  overviewSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
    hide?: boolean
  }[] = [
    { linkName: 'dashboard', iconName: 'dashboard', linkText: 'Dashboard' },
    { linkName: 'charter', iconName: 'info', linkText: 'Tuyên ngôn' },
  ]

  projectSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
    hide?: boolean
  }[] = [
    { linkName: 'milestones', iconName: 'flag', linkText: 'Cột Mốc' },
    { linkName: 'tasks', iconName: 'assignment', linkText: 'Tác Vụ', hide: true },
    { linkName: 'meeting', iconName: 'insert_invitation', linkText: 'Lịch Hẹn' },
    { linkName: 'assets', iconName: 'inventory', linkText: 'Tài Sản' },
    //{ linkName: 'documents', iconName: 'folder', linkText: 'Tài Liệu' },
  ]

  contractSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
    hide?: boolean
  }[] = [
    { linkName: 'contracts', iconName: 'history_edu', linkText: 'Hợp Đồng' },
    { linkName: 'disbursements', iconName: 'account_balance', linkText: 'Giải Ngân', hide: true },
    { linkName: 'investor-disbursements', iconName: 'account_balance', linkText: 'Giải Ngân', hide: true },
    { linkName: 'transactions', iconName: 'swap_horiz', linkText: 'Giao Dịch' },
    { linkName: 'equity', iconName: 'equalizer', linkText: 'Cổ Phần' },
  ]

  callSideNavLinks: {
    linkName: string
    iconName: string
    linkText: string
    hide?: boolean
  }[] = [
    { linkName: 'investment-call', iconName: 'local_atm', linkText: 'Gọi Vốn' },
    { linkName: 'recruitment-post', iconName: 'plagiarism', linkText: 'Đăng Tuyển' },
  ]

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
