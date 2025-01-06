import { Component, Input, OnInit, OnDestroy, AfterViewInit, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { MatIconModule } from '@angular/material/icon';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HistorySidebarComponent } from 'src/app/layouts/history-sidebar/history-sidebar.component';
import { LeaderTransferService } from 'src/app/services/leader-transfer.service';
import { LeaderTransferHistoryModel } from 'src/app/shared/models/leader-transfer/leader-transfer-history.model';
import { Subject, takeUntil, catchError, throwError, filter } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { LargeViewportConfigService } from 'src/app/core/config/large-viewport-config.service';

@Component({
  selector: 'app-leader-history-sidebar',
  templateUrl: './leader-history-sidebar.component.html',
  styleUrls: ['./leader-history-sidebar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzAvatarModule,
    InitialsOnlyPipe,
    MatIconModule,
    HistorySidebarComponent,
    NzButtonModule
  ]
})
export class LeaderHistorySidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input({ required: true }) projectId!: string;

  historyEntries: LeaderTransferHistoryModel[] = [];
  page = 1;
  size = 10;
  totalRecords = 0;

  isLoading: boolean = false;
  isCollapsed: boolean = true;
  isLargeViewport: boolean = false;
  height: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private leaderTransferService: LeaderTransferService,
    private largeViewportConfigService: LargeViewportConfigService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.loadHistory();
    this.largeViewportConfigService.isLargeViewport$
      .pipe(
        filter(val => val != this.isLargeViewport),
        takeUntil(this.destroy$)
      )
      .subscribe(val => {
        this.isLargeViewport = val;
        this.isCollapsed = !val;
      });
    afterNextRender(() => this.calculateDistance());
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
    this.isLoading = true;
    this.leaderTransferService.getHistory(this.projectId, this.page, this.size)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.isLoading = false;
          this.notification.error('Lỗi', error.error || 'Không thể tải lịch sử chuyển giao!', { nzDuration: 2000 });
          return throwError(() => error);
        })
      )
      .subscribe(response => {
        this.historyEntries = response.data.filter(entry => entry.isAgreed);
        this.totalRecords = response.total;
        this.isLoading = false;
      });
  }

  onCollapsedChange(isCollapsed: boolean) {
    this.isCollapsed = isCollapsed;
  }

  nextPage() {
    if ((this.page * this.size) < this.totalRecords) {
      this.page++;
      this.loadHistory();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadHistory();
    }
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
}
