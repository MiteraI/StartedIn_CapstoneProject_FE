import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'

interface IModalData {
  projectId: string
  recruitmentId: string
}

@Component({
  selector: 'app-recruitment-apply-dialog',
  templateUrl: './recruitment-apply-dialog.component.html',
  styleUrls: ['./recruitment-apply-dialog.component.scss'],
  standalone: true,
  imports: [NzUploadModule, NzFormModule, NzTagModule, MatIconModule, ReactiveFormsModule, NzButtonModule],
})
export class RecruitmentApplyDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  cvForm: FormGroup
  fileList: NzUploadFile[] = []

  constructor(private fb: FormBuilder, private modalRef: NzModalRef, private antdNoti: AntdNotificationService, private recruitInviteService: RecruitInviteService) {
    this.cvForm = this.fb.group({
      files: [null, Validators.required],
    })
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.cvForm.get('files')?.setErrors(null)
    this.fileList = this.fileList.concat(file)

    return false
  }

  removeUpload = (file: NzUploadFile): boolean => {
    if (this.fileList.length <= 1) {
      this.cvForm.get('files')?.setErrors({ emptyList: true })
    }
    return true
  }

  uploadCV() {
    this.recruitInviteService.applyRecruitment(this.nzModalData.projectId, this.nzModalData.recruitmentId, { cvFiles: this.fileList }).subscribe({
      next: (res: any) => {
        this.antdNoti.openSuccessNotification('', res)
        this.modalRef.close()
      },
      error: (err) => {
        this.antdNoti.openErrorNotification('', err.error)
      },
    })
  }

  ngOnInit() {}
}
