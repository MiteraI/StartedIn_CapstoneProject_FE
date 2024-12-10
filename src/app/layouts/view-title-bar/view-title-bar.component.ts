import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { Subject, takeUntil } from 'rxjs'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { CommonModule } from '@angular/common'
import { NzModalModule } from 'ng-zorro-antd/modal'

@Component({
  selector: 'app-view-title-bar',
  standalone: true,
  imports: [
    MatIconModule,
    NzButtonModule,
    CommonModule,
    NzModalModule
  ],
  templateUrl: './view-title-bar.component.html',
  styleUrls: ['./view-title-bar.component.scss'],
})
export class ViewTitleBarComponent implements OnInit, OnDestroy {
  @Input({ required: true }) viewName: string = '';
  @Input() centered: boolean = false
  isDesktopView: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private viewMode: ViewModeConfigService,
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => (this.isDesktopView = val))
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
