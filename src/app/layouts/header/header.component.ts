import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { ProfileDropdownComponent } from '../profile-dropdown/profile-dropdown.component'
import { AccountService } from '../../core/auth/account.service'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { Authority } from 'src/app/shared/constants/authority.constants'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, RouterModule, ProfileDropdownComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input({ required: true }) isDesktopView: boolean = false
  @Input({ required: true }) inProjectDetails: boolean = false
  isInvestor = false
  isAdmin = false
  private destroy$ = new Subject<void>()

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.isInvestor = account?.authorities.includes(Authority.INVESTOR) ?? false
      this.isAdmin = account?.authorities.includes(Authority.ADMIN) ?? false
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
