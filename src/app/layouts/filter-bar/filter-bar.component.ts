import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { MatMenuModule } from '@angular/material/menu'
import { MatMenuTrigger } from '@angular/material/menu'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MenuStateService } from 'src/app/core/util/menu-state.service'
import { FormsModule } from '@angular/forms'
import { NzModalModule } from 'ng-zorro-antd/modal'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    MatIconModule,
    MatMenuModule,
    MatMenuTrigger,
    NzButtonModule,
    FormsModule,
    NzModalModule,
    CommonModule
  ],
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = '';
  @Input() searchValue: string = '';
  @Input() hideSearch: boolean = false;
  @Output() searchString = new EventEmitter<string>();
  @Output() filterMenuOpened = new EventEmitter<void>();
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  isDesktopView: boolean = false
  isSearching: boolean = false
  private destroy$ = new Subject<void>()

  constructor(
    private viewMode: ViewModeConfigService,
    private menuState: MenuStateService
  ) {}

  @ViewChild(MatMenuTrigger) set menuTrigger(trigger: MatMenuTrigger) {
    if (trigger) {
      this.menuState.setMenuTrigger(trigger);
    }
  }

  ngOnInit() {
    this.viewMode.isDesktopView$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.isDesktopView = val));
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  onSearchClick() {
    this.searchString.emit(this.searchInput.nativeElement.value);
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
