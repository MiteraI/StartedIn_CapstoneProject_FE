import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzListModule } from 'ng-zorro-antd/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-project-deal-detail',
  templateUrl: './project-deal-detail.page.html',
  styleUrls: ['./project-deal-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    NzModalModule,
    NzListModule,
    MatIconModule,
    VndCurrencyPipe
  ]
})
export class ProjectDealDetailPage implements OnInit {
  deal!: ProjectDealItem;
  projectId!: string;
  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private dealOfferService: DealOfferService,
    private notification: NzNotificationService,
    private location: Location
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.deal = data['deal'];
    });
    this.projectId = this.route.parent?.snapshot.paramMap.get('id')!;
  }

  acceptDeal() {
    this.modalService.confirm({
      nzTitle: 'Chấp nhận thỏa thuận',
      nzContent: `Chấp nhận thỏa thuận đầu tư của ${this.deal?.investorName}?`,
      nzOkText: 'Chấp nhận',
      nzOkType: 'primary',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.isLoading = true;
        this.dealOfferService.acceptDeal(this.deal!.id, this.projectId)
          .pipe(
            catchError(error => {
              this.isLoading = false;
              this.notification.error("Lỗi", error.error || "Chấp nhận thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.isLoading = false;
            this.notification.success("Thành công", "Chấp nhận thỏa thuận thành công!", { nzDuration: 2000 });
            this.deal = { ...this.deal!, dealStatus: DealStatus.ACCEPTED };
          });
      }
    });
  }

  rejectDeal() {
    this.modalService.confirm({
      nzTitle: 'Từ chối thỏa thuận',
      nzContent: `Từ chối thỏa thuận đầu tư của ${this.deal?.investorName}?`,
      nzOkText: 'Từ chối',
      nzCancelText: 'Hủy',
      nzOkDanger: true,
      nzOnOk: () => {
        this.isLoading = true;
        this.dealOfferService.rejectDeal(this.deal!.id, this.projectId)
          .pipe(
            catchError(error => {
              this.isLoading = false;
              this.notification.error("Lỗi", error.error || "Từ chối thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.isLoading = false;
            this.notification.success("Thành công", "Từ chối thỏa thuận thành công!", { nzDuration: 2000 });
            this.deal = { ...this.deal!, dealStatus: DealStatus.REJECTED };
          });
      }
    });
  }

  navigateToCreateContract() {
    this.router.navigate(['projects', this.projectId, 'create-investment-contract'], {
      queryParams: { dealId: this.deal?.id }
    });
  }

  goBack(): void {
    this.location.back(); // Navigate to the previous page
  }
}
