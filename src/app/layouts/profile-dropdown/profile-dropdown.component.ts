import { CommonModule } from '@angular/common'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { MatMenuModule } from '@angular/material/menu'
import { AccountService } from '../../core/auth/account.service'
import { Account } from '../../core/auth/account.model'
import { filter, ReplaySubject, takeUntil } from 'rxjs'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum'
import { Authority, AuthorityLabels } from 'src/app/shared/constants/authority.constants'
import { WebsocketService } from 'src/app/services/websocket.service'

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, MatMenuModule, RouterModule, MatIconModule],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.css',
})
export class ProfileDropdownComponent implements OnInit, OnDestroy {
  account: Account | null = null
  authority: Authority | null = null;
  authorityLabels = AuthorityLabels;
  isInvestor: boolean = false;
  role: TeamRole | null = null
  roleLabels = TeamRoleLabels;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(
    private accountService: AccountService,
    private roleService: RoleInTeamService,
    private webSocketService: WebsocketService
  ) {}

  logout() {
    this.accountService.logout()
    this.webSocketService.disconnect()
  }

  ngOnInit() {
    this.accountService.account$
      .pipe(
        takeUntil(this.destroyed$),
        filter(account => account !== null)
      )
      .subscribe(account => {
        this.account = account;
        this.authority = account!.authorities[0];
        this.isInvestor = this.authority === Authority.INVESTOR;
      })
    this.roleService.role$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(role => this.role = role)
  }

  ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }
}
