import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { DisbursementService } from 'src/app/services/disbursement.service';
import { DisbursementItemModel } from 'src/app/shared/models/disbursement/disbursement-item.model';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DisbursementStatus } from 'src/app/shared/enums/disbursement-status.enum';

@Component({
  selector: 'app-disburse-modal',
  templateUrl: './disburse-modal.component.html',
  styleUrls: ['./disburse-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzRadioModule,
    NzUploadModule,
    NzButtonModule,
    MatIconModule
  ]
})
export class DisburseModalComponent {
  disburseForm: FormGroup;
  fileList: NzUploadFile[] = [];

  constructor(
    private fb: FormBuilder,
    private disbursementService: DisbursementService,
    private notification: NzNotificationService,
    @Inject(NZ_MODAL_DATA) public data: DisbursementItemModel
  ) {
    this.disburseForm = this.fb.group({
      method: ['payment_gateway', [Validators.required]],
      files: [[]]
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.disburseForm.get('files')?.setErrors(null);
    this.fileList = this.fileList.concat(file);
    return false;
  };

  removeUpload = (file: NzUploadFile): boolean => {
    if (this.fileList.length <= 1) {
      this.disburseForm.get('files')?.setErrors({ emptyList: true });
    }
    return true;
  }

  handleConfirm() {
    const method = this.disburseForm.get('method')?.value;

    if (method === 'payment_gateway') {
      this.disbursementService
        .getPaymentUrl(this.data.id)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy đường dẫn thanh toán thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(url => window.location.href = url);
    } else {
      this.disbursementService
        .acceptDisbursement(this.data.id, this.fileList as unknown as File[])
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Tải lên tài liệu chứng minh thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(response => this.data.disbursementStatus = DisbursementStatus.ACCEPTED);
    }
  }
}
