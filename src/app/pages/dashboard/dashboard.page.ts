import { afterRender, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { DashboardModel } from 'src/app/shared/models/dashboard/dashboard.model';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { DashboardService } from 'src/app/services/dashboard.service';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { MatIcon, MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, 
    VndCurrencyPipe, 
    ViewTitleBarComponent,
    NzTableModule,
    MatIconModule]
})
export class DashboardPage implements OnInit {
  dashboard: DashboardModel | null = null;
  projectId: string = '';
  chartsRendered: boolean = false;
  disbursementChart: Chart | undefined;
  shareEquityChart: Chart<'pie', number[], string> | undefined;

  @Input({ required: true }) isFetchAllContractLoading: boolean = false
  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private notification: NzNotificationService,
  ) {
    afterRender(() => {
      if (!this.chartsRendered) {
        this.createDisbursementChart();
        this.createShareEquityChart();
        this.createMilestoneCharts();
      }
    })
  }
  getTeamRoleLabel(type: TeamRole) : string {
      return TeamRoleLabels[type]
  }

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;

      this.projectId = params.get('id')!;
      this.loadDashboardData();
    });
  }

  getAssigneeNames(task: any): string {
    return task.assignees && task.assignees.length > 0
      ? task.assignees
          .map((assignee: any) => `${assignee.fullName} (${assignee.actualManHour || 'N/A'})`)
          .join(', ')
      : '';
  }

  private loadDashboardData() {
    this.dashboardService
      .getDashboard(this.projectId)
      .pipe(
        catchError(error => {
          this.notification.error('Error', 'Failed to load share equities', { nzDuration: 2000 });
          return throwError(() => error);
        })
      )
      .subscribe(data => this.dashboard = data);
  }

  private createDisbursementChart() {
    const canvas = document.getElementById('disbursementChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboard) return;

    const labels = this.dashboard.selfDisbursedAmount ? ['Tổng dự án', 'Cá nhân'] : ['Tổng dự án'];
    const disbursedData = this.dashboard.selfDisbursedAmount ? [
      this.dashboard.disbursedAmount / 1000,
      this.dashboard.selfDisbursedAmount / 1000
    ] : [
      this.dashboard.disbursedAmount / 1000
    ];
    const remainingData = this.dashboard.selfRemainingDisbursement ? [
      this.dashboard.remainingDisbursement / 1000,
      this.dashboard.selfRemainingDisbursement / 1000
    ] : [
      this.dashboard.remainingDisbursement / 1000
    ]

    this.disbursementChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Đã giải ngân',
            data: disbursedData,
            backgroundColor: ['#10B981']
          },
          {
            label: 'Chưa giải ngân',
            data: remainingData,
            backgroundColor: ['#4F46E5']
          }
        ]
      },
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: '(nghìn đồng)'
            }
          },
          y: {
            stacked: true
          }
        }
      }
    });

    this.chartsRendered = true;
  }

  private createShareEquityChart() {
    const canvas = document.getElementById('shareEquityChart') as HTMLCanvasElement;
    if (!canvas || !this.dashboard) return;

    this.shareEquityChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: ['Sở hữu'],
        datasets: [{
          data: [this.dashboard.shareEquityPercentage, 100 - this.dashboard.shareEquityPercentage],
          backgroundColor: ['#4F46E5', '#E5E7EB']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });

    this.chartsRendered = true;
  }

  private createMilestoneCharts() {
    this.dashboard?.milestoneProgress.forEach(milestone => {
      const canvas = document.getElementById(`milestone-${milestone.id}`) as HTMLCanvasElement;
      if (!canvas) return;

      new Chart(canvas, {
        type: 'doughnut',
        data: {
          datasets: [{
            data: [milestone.progress ?? 0, 100 - (milestone.progress ?? 0)],
            backgroundColor: ['#4F46E5', '#E5E7EB']
          }]
        },
        options: {
          responsive: true,
          cutout: '80%',
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });
    });
  }
}
