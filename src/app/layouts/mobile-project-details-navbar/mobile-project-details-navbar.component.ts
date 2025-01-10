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
        this.role = role!
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
    { linkName: 'charter', iconName: 'info', linkText: 'Tuyên Ngôn' },
    { linkName: 'milestones', iconName: 'flag', linkText: 'Cột Mốc' },
    { linkName: 'transactions', iconName: 'swap_horiz', linkText: 'Giao Dịch' },
    { linkName: 'assets', iconName: 'inventory', linkText: 'Tài Sản' },
    { linkName: 'contracts', iconName: 'history_edu', linkText: 'Hợp Đồng' },
    { linkName: 'equity', iconName: 'equalizer', linkText: 'Cổ Phần' },
    { linkName: 'meeting', iconName: 'insert_invitation', linkText: 'Lịch Hẹn' },
    
  ]

  leaderSideNavLinks = [
    { linkName: 'tasks', iconName: 'assignment', linkText: 'Tác Vụ' },
    { linkName: 'disbursements', iconName: 'account_balance', linkText: 'Giải Ngân' },
    { linkName: 'investment-call', iconName: 'local_atm', linkText: 'Gọi Vốn' },
    { linkName: 'recruitment-post', iconName: 'plagiarism', linkText: 'Đăng Tuyển' },
    { linkName: 'project-detail', iconName: 'description', linkText: 'Miêu Tả' },
    { linkName: 'project-approval-list', iconName: 'border_color', linkText: 'Đăng Ký' },
    { linkName: 'members', iconName: 'group', linkText: 'Thành Viên' }
  ]

  memberSideNavLinks = [
    { linkName: 'tasks', iconName: 'assignment', linkText: 'Tác Vụ' }
  ]

  investorSideNavLinks = [
    { linkName: 'investor-disbursements', iconName: 'account_balance', linkText: 'Giải Ngân' }
  ]
}
