import { DatePipe } from "@angular/common"
import { HttpErrorResponse } from "@angular/common/http"
import { Component, Inject, inject } from "@angular/core"
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms"
import { NzButtonModule } from "ng-zorro-antd/button"
import { NzDatePickerModule } from "ng-zorro-antd/date-picker"
import { NzFormModule } from "ng-zorro-antd/form"
import { NzIconModule } from "ng-zorro-antd/icon"
import { NzInputModule } from "ng-zorro-antd/input"
import { NzInputNumberModule } from "ng-zorro-antd/input-number"
import { NZ_MODAL_DATA, NzModalRef } from "ng-zorro-antd/modal"
import { NzSelectModule } from "ng-zorro-antd/select"
import { AntdNotificationService } from "src/app/core/util/antd-notification.service"
import { AssetService } from "src/app/services/asset.service"
import { AssetCreateModel } from "src/app/shared/models/asset/asset-create.model"
import { VndCurrencyPipe } from "src/app/shared/pipes/vnd-currency.pipe"

interface IModalData {
  nzData: { projectId: any }
}

@Component({
  selector: 'app-create-asset-modal',
  templateUrl: './create-asset-modal.component.html',
  styleUrls: ['./create-asset-modal.component.scss'],
  standalone: true,
  imports: [
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzSelectModule,
    NzIconModule,
    NzInputNumberModule
  ]
})
export class CreateAssetModalComponent {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  assetForm: FormGroup
  vndCurrencyPipe = new VndCurrencyPipe();
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,'');
  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) private projectId: string,
  ) {
    this.assetForm = this.fb.group({
      assetName: ['',[Validators.required]],
      price: [0, [Validators.required,Validators.min(0)]],
      purchaseDate: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      serialNumber: [null]
    })
  }

  onSubmit() {
    if (this.assetForm.valid) {
      const assetData: AssetCreateModel = {
        assetName: this.assetForm.value.assetName,
        price: this.assetForm.value.price,
        purchaseDate: this.assetForm.value.purchaseDate
          ? new Date(this.assetForm.value.purchaseDate).toISOString().split('T')[0]
          : null,
        quantity: this.assetForm.value.quantity,
        serialNumber: this.assetForm.value.serialNumber
      };

      this.assetService.createNewAsset(this.projectId, assetData).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Tạo tài sản thành công', '');
          this.assetService.refreshAsset$.next(true)
          this.nzModalRef.close();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error);
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau');
          } else {
            console.error('', error);
          }
        },
      });
    }
  }
}
