import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule, Location } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { Subject, filter, takeUntil } from 'rxjs'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'

@Component({
  selector: 'app-mobile-project-details-navbar',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './mobile-project-details-navbar.component.html',
  styleUrls: ['./mobile-project-details-navbar.component.scss'],
})
export class MobileProjectDetailsNavbarComponent implements OnInit, OnDestroy {
  currentId!: string

  role: TeamRole | null = null
  teamRole = TeamRole
  private destroy$ = new Subject<void>()

  constructor(
    private location: Location,
    private roleService: RoleInTeamService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => this.currentId = params.get('id')!)
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

  navigateBack() {
    this.location.back()
  }

  // TODO update links
  sharedSideNavLinks = [
    { linkName: 'dashboard', iconName: 'dashboard', linkText: 'Dashboard' },
    { linkName: 'charter', iconName: 'info_icon', linkText: 'Điều Lệ' },
    { linkName: 'milestones', iconName: 'flag_icon', linkText: 'Cột Mốc' },
    { linkName: 'transactions', iconName: 'swap_horiz_icon', linkText: 'Giao Dịch' },
    { linkName: 'assets', iconName: 'inventory_icon', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu_icon', linkText: 'Hợp Đồng' },
    { linkName: 'equity', iconName: 'equalizer_icon', linkText: 'Cổ Phần' },
  ]

  leaderSideNavLinks = [
    { linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' },
    { linkName: 'disbursements', iconName: 'account_balance_icon', linkText: 'Giải Ngân' },
    { linkName: 'investment-call', iconName: 'local_atm_icon', linkText: 'Gọi Vốn' },
    { linkName: 'deals', iconName: 'handshake', linkText: 'Deals' },
    { linkName: 'payos', iconName: 'payment', linkText: 'PayOS' },
    { linkName: 'recruitment-post', iconName: 'plagiarism_icon', linkText: 'Đăng Tuyển' },
  ]

  memberSideNavLinks = [
    { linkName: 'tasks', iconName: 'assignment_icon', linkText: 'Tác Vụ' }
  ]

  investorSideNavLinks = [
    { linkName: 'investor-disbursements', iconName: 'account_balance_icon', linkText: 'Giải Ngân' }
  ]
}
