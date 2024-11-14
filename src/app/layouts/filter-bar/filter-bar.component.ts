import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProfileDropdownComponent } from '../header/profile-dropdown/profile-dropdown.component'
import { Router } from '@angular/router'
import { MatMenuModule } from '@angular/material/menu'
import { MatMenuTrigger } from '@angular/material/menu'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MenuStateService } from 'src/app/core/util/menu-state.service'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    MatIconModule,
    ProfileDropdownComponent,
    MatMenuModule,
    MatMenuTrigger,
    NzButtonModule,
    FormsModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = '';
  @Input() searchValue: string = '';
  @Output() searchString = new EventEmitter<string>();
  @Output() filterMenuOpened = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isDesktopView: boolean = false
  isSearching: boolean = false
  private destroy$ = new Subject<void>()

  constructor(
    private viewMode: ViewModeConfigService,
    private router: Router,
    private menuState: MenuStateService
  ) {}

  @ViewChild(MatMenuTrigger) set menuTrigger(trigger: MatMenuTrigger) {
    if (trigger) {
      this.menuState.setMenuTrigger(trigger);
    }
  }

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSearchClick() {
    this.searchString.emit(this.searchInput.nativeElement.value);
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

  onMenuOpened() {
    this.filterMenuOpened.emit();
  }
}
