import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { AssetService } from 'src/app/services/asset.service';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { ProjectService } from 'src/app/services/project.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { CommonModule } from '@angular/common';

interface IModalData {
  assetId: string;
  projectId: string;
  remainQuantity: number;
  buyPrice?: number;
}

@Component({
  selector: 'app-sell-asset-modal',
  templateUrl: './sell-asset-modal.component.html',
  styleUrls: ['./sell-asset-modal.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzSelectModule,
    CommonModule,
    VndCurrencyPipe
  ]
})
export class SellAssetModalComponent {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA);
  sellForm: FormGroup;
  members: TeamMemberModel[] = [];
  vndCurrencyPipe = new VndCurrencyPipe();
  selectedFile: File | null = null;

  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,'');

  constructor(
    private fb: FormBuilder,
    private assetService: AssetService,
    private projectService: ProjectService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) private modalData: IModalData
  ) {
    this.sellForm = this.fb.group({
      sellPrice: [0, [Validators.required, Validators.min(0)]],
      sellQuantity: [1, [Validators.required, Validators.min(1), Validators.max(this.modalData.remainQuantity)]],
      fromId: [''],
      fromName: [''],
    });

    this.loadMembers();
  }

  loadMembers() {
    this.projectService.getMembers(this.modalData.projectId).subscribe(members => {
      this.members = members;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.sellForm.valid && this.selectedFile) {
      const sellData = {
        ...this.sellForm.value,
        evidenceFile: this.selectedFile
      };

      this.assetService.sellAsset(this.modalData.projectId, this.modalData.assetId, sellData).subscribe({
        next: () => {
          this.antdNoti.openSuccessNotification('Thanh lý tài sản thành công', '');
          this.assetService.refreshAsset$.next(true);
          this.nzModalRef.close();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error);
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', error.error || 'Đã xảy ra lỗi, vui lòng thử lại sau');
          } else {
            console.error('Error selling asset:', error);
          }
        }
      });
    }
  }
}
