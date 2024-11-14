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
import { CommonModule, Location } from '@angular/common'

@Component({
  selector: 'app-mobile-title-bar',
  standalone: true,
  imports: [
    MatIconModule,
    ProfileDropdownComponent,
    NzButtonModule,
    CommonModule
  ],
  templateUrl: './mobile-title-bar.component.html',
  styleUrls: ['./mobile-title-bar.component.scss'],
})
export class MobileTitleBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = '';

  isDesktopView: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewMode: ViewModeConfigService,
    private location: Location
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }

  navigateBack() {
    this.location.back();
  }
}
