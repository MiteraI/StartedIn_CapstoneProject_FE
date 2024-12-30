import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { AssetService } from 'src/app/services/asset.service';
import { AssetStatus, AssetStatusLabels } from 'src/app/shared/enums/asset-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AssetModel } from 'src/app/shared/models/asset/asset.model';
import { MatIconModule } from '@angular/material/icon';
import { TransactionModel } from 'src/app/shared/models/transaction/transaction.model';
import { Router } from '@angular/router';

interface IModalData {
  assetId: string
  projectId: string
  quantity: number
  remainQuantity: number
  editable?: boolean
}

@Component({
  selector: 'app-update-asset-modal',
  templateUrl: './update-asset-modal.component.html',
  styleUrls: ['./update-asset-modal.component.scss'],
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzSelectModule,
    NzIconModule,
    NzInputNumberModule,
    NzSpinModule,
    DatePipe,
    VndCurrencyPipe,
    CommonModule,
    MatIconModule
  ]
})

export class UpdateAssetModalComponent  implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)

  statusOptions = Object.values(AssetStatus)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as AssetStatus,
      label: AssetStatusLabels[value as AssetStatus]
    }));

  assetForm: FormGroup
  isFetchAssetDetailLoading = false
  asset!: AssetModel;
  buyTransaction?: TransactionModel

  constructor(
    private fb: FormBuilder,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private assetService: AssetService,
    private router: Router
  ) {
    this.assetForm = this.fb.group({
      remainQuantity: [0, [Validators.required, Validators.min(0), Validators.max(this.nzModalData.remainQuantity)]],
      status: [null]
    })
  }

  onSubmit(){
    if(this.assetForm.valid && this.assetForm.dirty) {
      this.assetService.updateAsset(
        this.nzModalData.projectId,
        this.nzModalData.assetId,
        this.assetForm.value
      ).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Cập nhật tài sản thành công', '')
          this.assetService.refreshAsset$.next(true)
          this.nzModalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  ngOnInit() {
    this.isFetchAssetDetailLoading = true;

    // Fetch asset details
    this.assetService.getAssetDetail(this.nzModalData.projectId, this.nzModalData.assetId)
      .subscribe({
        next: (response) => {
          this.asset = response;
          this.assetForm.patchValue({
            remainQuantity: response.remainQuantity,
            status: response.status
          });

          // Disable the status field if remainQuantity is 0
          if (response.remainQuantity === 0) {
            this.assetForm.get('status')?.disable();
          }

          // Listen for remainQuantity changes
          this.assetForm.get('remainQuantity')?.valueChanges.subscribe((value) => {
            const statusControl = this.assetForm.get('status');
            if (value === 0) {
              statusControl?.setValue(AssetStatus.UNAVAILABLE);
              statusControl?.disable();
            } else {
              statusControl?.enable();
            }
          });

          this.buyTransaction = this.asset.transactions
            .find(transaction => this.extractTransactionInfo(transaction.content).quantity === 0)

          this.asset.transactions = this.asset.transactions
            .filter(transaction => this.extractTransactionInfo(transaction.content).quantity !== 0)

          this.isFetchAssetDetailLoading = false;
        },
        error: (error) => {
          this.antdNoti.openErrorNotification('Lỗi', 'Không thể lấy thông tin tài sản');
          this.nzModalRef.close();
        },
      });
  }

  extractTransactionInfo(content: string) {
    const quantityMatch = content.match(/Số lượng: (\d+)/);
    const priceMatch = content.match(/Đơn giá: (\d+)/);

    return {
      quantity: quantityMatch ? parseInt(quantityMatch[1]) : 0,
      unitPrice: priceMatch ? parseInt(priceMatch[1]) : 0
    };
  }

  navigateToBuyTransaction() {
    this.router.navigate([
      '/projects',
      this.nzModalData.projectId,
      'transactions',
      this.buyTransaction?.id
    ])
    this.nzModalRef.close()
  }
}
