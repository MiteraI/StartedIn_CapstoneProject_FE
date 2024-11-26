import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TitleBarComponent } from '../../layouts/title-bar/title-bar.component'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { MatIconModule } from '@angular/material/icon'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { Subject, switchMap, takeUntil, finalize } from 'rxjs'
import { NzModalService } from 'ng-zorro-antd/modal'
import { ActivatedRoute } from '@angular/router'
import { CreateInvestmentCallModalComponent } from 'src/app/components/investment-call-page/create-investment-call-modal/create-investment-call-modal.component'
import { InvestmentCallTableComponent } from 'src/app/components/investment-call-page/investment-call-table/investment-call-table.component'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { InvestmentCallResponseDto } from 'src/app/shared/models/investment-call/investment-call-response-dto.model'
import { InvestmentCallListComponent } from 'src/app/components/investment-call-page/investment-call-list/investment-call-list.component'

@Component({
  selector: 'app-investment-call-page',
  templateUrl: './investment-call-page.page.html',
  styleUrls: ['./investment-call-page.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, TitleBarComponent, NzButtonModule, MatIconModule, InvestmentCallTableComponent, InvestmentCallListComponent],
})
export class InvestmentCallPagePage implements OnInit {
  isDesktopView: boolean = false
  private destroy$ = new Subject<void>()
  projectId = ''
  listInvestmentCall: InvestmentCallResponseDto[] = []
  isFetchAllCallLoading: boolean = false

  constructor(
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private activatedRoute: ActivatedRoute,
    private investmentCallService: InvestmentCallService
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((val) => (this.isDesktopView = val))
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    
    // fetch the data again when create new item
    this.investmentCallService.refreshInvestmentCall$.pipe(
      switchMap(() => {
        this.isFetchAllCallLoading = true
        return this.investmentCallService.getInvestmentCallList(this.projectId).pipe(
          finalize(() => this.isFetchAllCallLoading = false)
        );
      })
    ).subscribe((investmentCall) => {
      this.listInvestmentCall = investmentCall;
    });

    this.fetchInvestmentCalls()
  }

  private fetchInvestmentCalls() {
    this.isFetchAllCallLoading = true
    this.investmentCallService.getInvestmentCallList(this.projectId).subscribe((data) => {
      this.listInvestmentCall = data
      this.isFetchAllCallLoading = false
    })
  }

  openCreateInvestmentCallModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Đợt Gọi Vốn Mới',
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzContent: CreateInvestmentCallModalComponent,
      nzData: {
        projectId: this.projectId,
      },
      nzFooter: null,
    })
  }

  
}
