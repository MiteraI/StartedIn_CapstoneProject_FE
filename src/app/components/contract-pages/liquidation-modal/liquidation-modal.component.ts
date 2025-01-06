import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NzFormModule } from 'ng-zorro-antd/form';
import { catchError, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ContractService } from 'src/app/services/contract.service';

interface IModalData {
  projectId: string;
  contractId: string;
  isFromLeader?: boolean;
}

@Component({
  selector: 'app-liquidation-modal',
  templateUrl: './liquidation-modal.component.html',
  styleUrls: ['./liquidation-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzUploadModule,
    NzButtonModule,
    ReactiveFormsModule,
    MatIconModule,
    NzFormModule
  ]
})
export class LiquidationModalComponent implements OnInit {
  data: IModalData = inject(NZ_MODAL_DATA);
  uploadForm!: FormGroup;
  fileList: NzUploadFile[] = [];
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private contractService: ContractService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.uploadForm = this.fb.group({
      file: [null, [Validators.required]]
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    const validFileTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ];

    if (!file.type || !validFileTypes.includes(file.type)) {
        this.notification.error('Lỗi', 'Chỉ chấp nhận file Word (.docx) hoặc PDF (.pdf)');
        return false;
    }
    this.fileList = [file];
    this.uploadForm.patchValue({ file });
    return false;
  }

  removeFile = (): boolean => {
    this.fileList = [];
    this.uploadForm.patchValue({ file: null });
    return true;
  }

  handleUpload(): void {
    if (this.uploadForm.invalid || !this.fileList.length) return;

    this.isUploading = true;
    if (this.data.isFromLeader) {
      this.contractService.terminate(this.data.projectId, this.data.contractId, this.fileList[0] as any)
        .pipe(
          catchError(error => {
            this.notification.error('Lỗi', error.error || 'Kết thúc hợp đồng thất bại!');
            this.isUploading = false;
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(() => {
          this.notification.success('Thành công', 'Kết thúc hợp đồng thành công!');
          this.modalRef.close(true);
        });
    } else {
      this.contractService.addLiquidationNote(this.data.projectId, this.data.contractId, this.fileList[0] as any)
        .pipe(
          catchError(error => {
            this.notification.error('Lỗi', error.error || 'Tải lên biên bản thanh lý thất bại!');
            this.isUploading = false;
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(() => {
          this.notification.success('Thành công', 'Tải lên biên bản thanh lý thành công!');
          this.modalRef.close(true);
        });
    }
  }

  closeModal(): void {
    this.modalRef.close();
  }
}
