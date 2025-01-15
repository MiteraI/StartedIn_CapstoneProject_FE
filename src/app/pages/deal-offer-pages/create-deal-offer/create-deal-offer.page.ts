import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute } from '@angular/router';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { DealOfferCreateModel } from 'src/app/shared/models/deal-offer/deal-offer-create.model';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model';
import { CommonModule } from '@angular/common';
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular';
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants';
import { CreateDisbursementFormComponent } from 'src/app/components/contract-pages/create-disbursement-form/create-disbursement-form.component';
import { DisbursementCreateModel } from 'src/app/shared/models/disbursement/disbursement-create.model';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzListModule } from 'ng-zorro-antd/list';
import { MatIconModule } from '@angular/material/icon';
import { NzIconModule } from 'ng-zorro-antd/icon';


@Component({
  selector: 'app-create-deal-offer',
  templateUrl: './create-deal-offer.page.html',
  styleUrls: ['./create-deal-offer.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzModalModule,
    NzListModule,
    NzIconModule,
    CommonModule,
    EditorModule,
    VndCurrencyPipe,
    MatIconModule
  ]
})
export class CreateDealOfferPage implements OnInit {
  dealOfferForm!: FormGroup;
  projectInfo!: ProjectOveriewModel;

  percentFormatter = (value: number) => `${value}%`;
  percentParser = (value: string) => value.replace('%', '');
  vndCurrencyPipe!: VndCurrencyPipe;
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  disbursements: DisbursementCreateModel[] = [];

  isLoading = false;

  // Add editor configuration
  editorKey = EDITOR_KEY;
  init: EditorComponent['init'] = {
    branding: false,
    plugins: 'lists link code help wordcount',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dealOfferService: DealOfferService,
    private modalService: NzModalService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.vndCurrencyPipe = new VndCurrencyPipe();
    this.dealOfferForm = this.fb.group({
      amount: [10000000, [Validators.required, Validators.min(1000)]],
      equityShareOffer: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      termCondition: ['', [Validators.required]]
    });

    this.route.data.subscribe(data => {
      this.projectInfo = data['projectOverview'];
    });
  }

  onSubmit(): void {
    if (this.dealOfferForm.valid) {
      const dealOffer: DealOfferCreateModel = {
        ...this.dealOfferForm.value,
        projectId: this.route.snapshot.paramMap.get('projectId')!,
        disbursements: this.disbursements
      };
      this.isLoading = true;
      this.dealOfferService
        .postDealOffer(dealOffer)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", error.error || "Tạo thỏa thuận thất bại!", { nzDuration: 2000 });
            this.isLoading = false;
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(result => {
          this.isLoading = false;
          this.notification.success("Thành công", "Tạo thỏa thuận thành công!", { nzDuration: 2000 });
          this.router.navigate(['deals']);
        });
    }
  }

  get disbursementTotalAmount(): number {
    return this.disbursements
      .filter(d => d.amount)
      .reduce((sum, d) => sum + d.amount, 0);
  }

  openDisbursementModal(disbursement?: DisbursementCreateModel, index?: number) {
    const isEdit = disbursement !== undefined;
    const totalContractAmount = this.dealOfferForm.get('amount')?.value || 0;

    this.modalService.create({
      nzTitle: isEdit ? 'Sửa lần giải ngân' : 'Thêm lần giải ngân',
      nzContent: CreateDisbursementFormComponent,
      nzData: {
        disbursement,
        projectStartDate: new Date(this.projectInfo.startDate),
        projectEndDate: this.projectInfo.endDate ? new Date(this.projectInfo.endDate) : null,
        totalContractAmount: totalContractAmount,
        totalDisbursedAmount: this.disbursementTotalAmount,
        currentAmount: isEdit ? disbursement.amount : 0
      },
      nzCancelText: "Hủy",
      nzOnOk: (componentInstance) => {
        if (componentInstance.disbursementForm.invalid) {
          return false;
        }

        const formValue = componentInstance.disbursementForm.value;
        formValue.startDate = formValue.startDate.toISOString().split('T')[0];
        formValue.endDate = formValue.endDate.toISOString().split('T')[0];

        if (isEdit) {
          this.disbursements = [
            ...this.disbursements.slice(0, index),
            formValue,
            ...this.disbursements.slice(index! + 1)
          ];
        } else {
          this.disbursements = [...this.disbursements, formValue];
        }

        return true;
      }
    });
  }

  removeDisbursement(index: number): void {
    this.disbursements = [
      ...this.disbursements.slice(0, index),
      ...this.disbursements.slice(index + 1)
    ];
  }
}
