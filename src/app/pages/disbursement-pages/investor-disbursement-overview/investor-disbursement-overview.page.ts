import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component';
import { RouterModule } from '@angular/router';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { DisbursementForProjectModel } from 'src/app/shared/models/disbursement/disbursement-for-project.model';
import { Chart } from 'chart.js/auto';
import { Subject, takeUntil } from 'rxjs';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-investor-disbursement-overview',
  templateUrl: './investor-disbursement-overview.page.html',
  styleUrls: ['./investor-disbursement-overview.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ViewTitleBarComponent,
    NzSpinModule,
    VndCurrencyPipe,
    MatIconModule
  ]
})
export class InvestorDisbursementOverviewPage implements OnInit, OnDestroy {
  projects: DisbursementForProjectModel[] = [];
  pageIndex = 1;
  pageSize = 15;
  totalRecords = 0;
  isLoading = false;
  private charts: Chart[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private disbursementService: DisbursementService,
    private scrollService: ScrollService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.loadProjects();

    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMore();
      });
  }

  ngOnDestroy() {
    this.charts.forEach(chart => chart.destroy());
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProjects(append: boolean = false) {
    if (this.isLoading) return;

    this.isLoading = true;
    this.disbursementService.getProjectDisbursementInfoForInvestor(this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          this.projects = append ? [...this.projects, ...response.data] : response.data;
          this.totalRecords = response.total;
          this.isLoading = false;
          setTimeout(() => this.initializeCharts(), 0);
        },
        error: () => {
          this.notification.error('Lỗi', 'Không thể tải thông tin giải ngân', { nzDuration: 2000 });
          this.isLoading = false;
        }
      });
  }

  private loadMore() {
    if (this.isLoading || this.pageIndex * this.pageSize >= this.totalRecords) return;

    this.pageIndex++;
    this.loadProjects(true);
  }

  private initializeCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];

    this.projects.forEach((project, projectIndex) => {
      project.disbursementInfo.forEach((info, index) => {
        const canvas = document.getElementById(`chart-${projectIndex}-${index}`) as HTMLCanvasElement;
        if (!canvas) return;

        const chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: [''],
            datasets: [
              {
                label: 'Đã giải ngân',
                data: [info.disbursedAmount / 1000],
                backgroundColor: '#10B981',
                borderRadius: 4
              },
              {
                label: 'Chưa giải ngân',
                data: [info.remainingDisbursement / 1000],
                backgroundColor: '#4F46E5',
                borderRadius: 4
              }
            ]
          },
          options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: index === 0 ?
                  'Tháng trước' :
                  index === 1 ?
                    'Tháng này' :
                    'Tháng sau'
              },
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: '(nghìn đồng)'
                }
              },
              y: {
                stacked: true,
                display: false
              }
            }
          }
        });

        this.charts.push(chart);
      });
    });
  }
}
