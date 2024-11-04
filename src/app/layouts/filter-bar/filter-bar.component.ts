import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProfileDropdownComponent } from '../header/profile-dropdown/profile-dropdown.component'
import { Router } from '@angular/router'
import { MatMenuModule } from '@angular/material/menu'
import { NzButtonModule } from 'ng-zorro-antd/button'

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [MatIconModule, ProfileDropdownComponent, MatMenuModule, NzButtonModule],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = ''
  @Output() searchString = new EventEmitter<string>()
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>

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

  onSearchClick() {
    const searchValue = this.searchInput.nativeElement.value
    this.searchString.emit(searchValue)
  }

  navigateToHome() {
    if (this.isSearching) {
      this.closeSearchBarMobile()
    } else {
      this.router.navigate([''])
    }
  }

  openSearchBarMobile() {
    this.isSearching = true
  }

  closeSearchBarMobile() {
    this.isSearching = false
  }
}
