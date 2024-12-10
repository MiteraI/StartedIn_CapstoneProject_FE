import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { ProjectDealItem } from 'src/app/shared/models/deal-offer/project-deal-item.model';
import { DealStatus, DealStatusLabels } from 'src/app/shared/enums/deal-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';

@Component({
  selector: 'app-project-deal-detail',
  templateUrl: './project-deal-detail.page.html',
  styleUrls: ['./project-deal-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, NzModalModule, VndCurrencyPipe]
})
export class ProjectDealDetailPage implements OnInit {
  deal!: ProjectDealItem;
  projectId!: string;
  dealStatuses = DealStatus;
  statusLabels = DealStatusLabels;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private dealOfferService: DealOfferService,
    private notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.deal = data['deal'];
    });
    this.projectId = this.route.parent?.snapshot.paramMap.get('id')!;
  }

  acceptDeal() {
    this.modalService.confirm({
      nzTitle: 'Accept Deal',
      nzContent: `Are you sure you want to accept this deal from ${this.deal?.investorName}?`,
      nzOkText: 'Accept',
      nzOkType: 'primary',
      nzOnOk: () => {
        this.dealOfferService.acceptDeal(this.deal!.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Chấp nhận thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.deal = { ...this.deal!, dealStatus: DealStatus.ACCEPTED };
          });
      }
    });
  }

  rejectDeal() {
    this.modalService.confirm({
      nzTitle: 'Reject Deal',
      nzContent: `Are you sure you want to reject this deal from ${this.deal?.investorName}?`,
      nzOkText: 'Reject',
      nzOkDanger: true,
      nzOnOk: () => {
        this.dealOfferService.rejectDeal(this.deal!.id, this.projectId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Từ chối thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
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
}
