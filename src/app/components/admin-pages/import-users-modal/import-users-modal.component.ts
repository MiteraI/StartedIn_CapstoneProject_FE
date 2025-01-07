import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from 'src/app/services/admin.service';
import { NzFormModule } from 'ng-zorro-antd/form';
import { catchError, finalize, throwError } from 'rxjs';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-import-users-modal',
  templateUrl: './import-users-modal.component.html',
  styleUrls: ['./import-users-modal.component.scss'],
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
export class ImportUsersModalComponent implements OnInit {
  importForm!: FormGroup;
  fileList: NzUploadFile[] = [];
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private modalRef: NzModalRef,
    private notification: NzNotificationService,
    private modalService: NzModalService
  ) {}

  ngOnInit() {
    this.importForm = this.fb.group({
      file: [null, [Validators.required]]
    });
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      this.notification.error('Lỗi', 'Chỉ chấp nhận file Excel (.xlsx)');
      return false;
    }
    this.fileList = [file];
    this.importForm.patchValue({ file });
    return false;
  }

  removeFile = (): boolean => {
    this.fileList = [];
    this.importForm.patchValue({ file: null });
    return true;
  }

  handleImport(): void {
    if (this.importForm.invalid || !this.fileList.length) return;

    this.isUploading = true;
    this.adminService.importUsers(this.fileList[0] as any)
      .pipe(
        catchError(error => {
          if (error.status === 400) {
            this.modalService.error({
              nzTitle: 'Lỗi Import người dùng',
              nzContent: error.error.errors.join('\n')
            })
            return throwError(() => new Error(error.error.message));
          }
          this.notification.error('Lỗi', error.error || 'Import người dùng thất bại!');
          return throwError(() => new Error(error.error.message));
        }),
        finalize(() => this.isUploading = false)
      )
      .subscribe(() => {
        this.notification.success('Thành công', 'Import người dùng thành công!');
        this.modalRef.close(true);
      },);
  }

  closeModal(): void {
    this.modalRef.close();
  }
}
