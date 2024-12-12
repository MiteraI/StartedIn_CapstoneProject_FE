import { Component, Input, OnInit, AfterViewInit, OnDestroy, afterNextRender } from '@angular/core';
import { ContractService } from 'src/app/services/contract.service';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ContractHistoryModel } from 'src/app/shared/models/contract/contract-history.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { MatIconModule } from '@angular/material/icon';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-contract-history-sidebar',
  templateUrl: './contract-history-sidebar.component.html',
  styleUrls: ['./contract-history-sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzAvatarModule,
    InitialsOnlyPipe,
    MatIconModule,
    MatSidenavModule
  ]
})
export class ContractHistorySidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) contractId!: string;

  historyEntries: ContractHistoryModel[] = [];
  isDesktopView: boolean = false;
  isCollapsed: boolean = true;
  height: number = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private contractService: ContractService,
    private viewModeConfigService: ViewModeConfigService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.loadHistory();
    this.viewModeConfigService.isDesktopView$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDesktop => {
        this.isDesktopView = isDesktop;
        this.isCollapsed = !isDesktop;
      });
    afterNextRender(() => this.calculateDistance())
  }

  ngAfterViewInit() {
    this.calculateDistance();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  loadHistory() {
    this.contractService
      .getHistory(this.contractId, this.projectId)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.notification.error('Lỗi', 'Lấy lịch sử ký kết thất bại!', { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(history => {
        this.historyEntries = history.filter(entry => entry.isReject || entry.signedDate);
      });
  }

  calculateDistance() {
    const titleBar = document.querySelector('app-project-title-bar');
    const footer = document.querySelector('app-footer');

    if (titleBar && footer) {
      const titleBarRect = titleBar.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();

      this.height = footerRect.top - titleBarRect.bottom;
    }
  }

  onResize() {
    this.calculateDistance();
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
