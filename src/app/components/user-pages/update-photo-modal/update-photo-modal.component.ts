import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { NzUploadModule, NzUploadFile } from 'ng-zorro-antd/upload';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-update-photo-modal',
  templateUrl: './update-photo-modal.component.html',
  styleUrls: ['./update-photo-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, NzUploadModule, NzButtonModule, MatIconModule]
})
export class UpdatePhotoModalComponent {
  fileList: NzUploadFile[] = [];
  previewImage: string | undefined;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { type: 'profile' | 'cover' }
  ) {}

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = [file];
    this.getBase64(file as any, (img: string) => {
      this.previewImage = img;
    });
    return false;
  };

  private getBase64(img: File, callback: (img: string) => void): void {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result as string));
    reader.readAsDataURL(img);
  }

  submitForm(): void {
    if (this.fileList.length > 0) {
      this.modalRef.close(this.fileList[0]);
    }
  }

  cancel(): void {
    this.modalRef.close();
  }
}
