import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { MatMenuModule } from '@angular/material/menu'
import { AccountService } from '../../../core/auth/account.service'
import { Account } from '../../../core/auth/account.model'
import { ReplaySubject, takeUntil } from 'rxjs'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [CommonModule, MatMenuModule, RouterModule],
  templateUrl: './profile-dropdown.component.html',
  styleUrl: './profile-dropdown.component.css',
})
export class ProfileDropdownComponent {
  account: Account | null = null
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1)

  constructor(private accountService: AccountService) {}

  logout() {
    this.accountService.logout()
  }

  ngOnInit() {
    this.accountService.account$.pipe(takeUntil(this.destroyed$)).subscribe((account) => (this.account = account))
  }

  ngOnDestroy() {
    this.destroyed$.next(true)
    this.destroyed$.complete()
  }
}
