import { DatePipe } from '@angular/common';
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
import { Subject } from 'rxjs';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { AssetService } from 'src/app/services/asset.service';
import { AssetStatus, AssetStatusLabels } from 'src/app/shared/enums/asset-status.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AssetModel } from 'src/app/shared/models/asset/asset.model';
interface IModalData {
  assetId: string
  projectId: string
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
    VndCurrencyPipe],
    providers:[DatePipe]
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
  vndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,'');
  isInfoChanged: boolean = false
  isFetchAssetDetailLoading = false
  isFromTransaction: boolean = false
  asset: AssetModel | null = null;
  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private assetService: AssetService,
  )
  {
    this.assetForm = this.fb.group({
      assetName:['',Validators.required],
      price:[0, [Validators.required,Validators.min(0)]],
      purchaseDate: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      remainQuantity: [0, [Validators.required, Validators.min(0)]],
      serialNumber: [null],
      status:[null]
    })    
  }
  
  onSubmit(){
    if(this.assetForm.valid && this.isInfoChanged)
    {
      const asset = {
        assetName: this.assetForm.value.assetName,
        price: this.assetForm.value.price,
        purchaseDate: this.assetForm.value.purchaseDate
          ? new Date(this.assetForm.value.purchaseDate).toISOString().split('T')[0] 
          : null,
        quantity: this.assetForm.value.quantity,
        remainQuantity: this.assetForm.value.remainQuantity,
        serialNumber: this.assetForm.value.serialNumber,
        status: this.assetForm.value.status
      }
      this.assetService.updateAsset(this.nzModalData.projectId,this.nzModalData.assetId,asset).subscribe({
        next:(response) => {
          this.antdNoti.openSuccessNotification('Cập nhật tài sản thành công','')
          this.nzModalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if(error.status === 400)
          {
            this.antdNoti.openErrorNotification('',error.error)
          }else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  handleInfoChanged() {
    this.isInfoChanged = true
  }

  ngOnInit() {
    this.isFetchAssetDetailLoading = true;
  
    // Fetch asset details
    this.assetService.getAssetDetail(this.nzModalData.projectId, this.nzModalData.assetId)
      .subscribe({
        next: (response) => {
          this.assetForm.patchValue({
            assetName: response.assetName,
            price: response.price,
            purchaseDate: response.purchaseDate,
            quantity: response.quantity,
            remainQuantity: response.remainQuantity,
            serialNumber: response.serialNumber,
            status: response.status
          });
  
          this.isFetchAssetDetailLoading = false;
          this.isFromTransaction = !!response.transactionId;
  
          // Disable the status field if remainQuantity is 0
          if (response.remainQuantity === 0) {
            this.assetForm.get('status')?.disable();
          }
  
          // Listen for remainQuantity changes
          this.assetForm.get('remainQuantity')?.valueChanges.subscribe((value) => {
            if (value === 0) {
              this.assetForm.get('status')?.disable();
            } else {
              this.assetForm.get('status')?.enable();
            }
          });
        },
        error: (error) => {
          this.antdNoti.openErrorNotification('Lỗi', 'Không thể lấy thông tin tài sản');
          this.nzModalRef.close();
        },
      });
  }

}
