import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShareEquityService } from 'src/app/services/share-equity.service';
import { ShareEquityItemModel } from 'src/app/shared/models/share-equity/share-equity-item.model';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { format } from 'date-fns';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { TeamRoleLabels } from 'src/app/shared/enums/team-role.enum';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-share-equities',
  templateUrl: './share-equities.page.html',
  styleUrls: ['./share-equities.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzDatePickerModule,
    NzSpinModule
  ]
})
export class ShareEquitiesPage implements OnInit {
  projectId: string = '';
  selectedDate: Date = new Date();
  equities: ShareEquityItemModel[] = [];

  chart: Chart<'doughnut', number[], string> | undefined;
  chartRendered: boolean = false;
  totalPercentage: number = 0;
  stakeholderTypes = TeamRoleLabels;

  isLoading = true;

  constructor(
    private shareEquityService: ShareEquityService,
    private route: ActivatedRoute,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;

      this.projectId = params.get('id')!;
      this.loadEquities();
    });
  }

  onDateChange(date: Date) {
    this.selectedDate = date;
    this.loadEquities();
  }

  private loadEquities() {
    const formattedDate = format(this.selectedDate, 'dd/MM/yyyy');
    this.isLoading = true;
    this.shareEquityService
      .getEquities(this.projectId, formattedDate)
      .pipe(
        catchError(error => {
          this.isLoading = false;
          if (error.error !== 'Người dùng không thuộc dự án.')
            this.notification.error('Error', error.error || 'Lấy thông tin cổ phần thất bại!', { nzDuration: 2000 });
          return throwError(() => error);
        })
      )
      .subscribe(equities => {
        this.equities = equities;
        this.totalPercentage = equities.reduce((sum, equity) => sum + equity.percentage, 0);
        this.createChart();
        this.isLoading = false;
      });
  }

  private createChart() {
    const canvas = document.getElementById('equityChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Generate evenly distributed colors for each stakeholder
    const colors = this.equities.map((_, index) => {
      const hue = (index * 360) / this.equities.length; // Evenly space hues
      const saturation = 70;
      const lightness = 50;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    });

    // Add "Not Yet Owned" portion if total is less than 100%
    const labels = [...this.equities.map(equity => equity.userFullName)];
    const data = [...this.equities.map(equity => equity.percentage)];

    if (this.totalPercentage < 100) {
      labels.push('Chưa sở hữu');
      data.push(100 - this.totalPercentage);
      colors.push('#E5E7EB'); // Gray color for unowned portion
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,  // Padding between the legend and chart
              font: {
                size: 14  // Adjust the font size of the legend labels
              }
            }
          }
        }
      }
    });

    this.chartRendered = true;
  }

  disableFutureDate = (current: Date): boolean => {
    return current && current > new Date(); // Disable future dates
  };
}
