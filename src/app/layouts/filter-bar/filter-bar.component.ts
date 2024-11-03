import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProfileDropdownComponent } from '../header/profile-dropdown/profile-dropdown.component'
import { Router } from '@angular/router'
import { MatMenuModule } from '@angular/material/menu'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [MatIconModule, ProfileDropdownComponent, MatMenuModule, CommonModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = ''
  isDesktopView: boolean = false
  isSearching: boolean = false
  private destroy$ = new Subject<void>()

  constructor(private viewMode: ViewModeConfigService, private router: Router) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  navigateToHome() {
    if (this.isSearching) {
      this.closeSearchBar()
    } else {
      this.router.navigate([''])
    }
  }

  openSearchBar() {
    this.isSearching = true
  }

  closeSearchBar() {
    this.isSearching = false
  }
}
