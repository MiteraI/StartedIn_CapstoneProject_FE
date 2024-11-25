import { Component, Input, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { ProfileDropdownComponent } from './profile-dropdown/profile-dropdown.component'
import { AccountService } from '../../core/auth/account.service'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, RouterModule, ProfileDropdownComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  @Input({ required: true }) isDesktopView: boolean = false
  @Input({ required: true }) inProjectDetails: boolean = false
  isInvestor = false;

  constructor(private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.identity().subscribe(account => {
      this.isInvestor = account?.authorities.includes('Investor') ?? false
    })
  }
}
