import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { finalize } from 'rxjs'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { UserService } from 'src/app/services/user.service'
import { ProjectCharter } from 'src/app/shared/models/project-charter/project-charter.model'
import { FullProfile } from 'src/app/shared/models/user/full-profile.model'

@Component({
  selector: 'app-request-approval-modal',
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NzIconModule, NzUploadModule, NzButtonModule, NzInputModule, NzSkeletonModule],
})
export class RequestApprovalModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  loading = false
  uploading = false

  projectId: string
  isProjectCharterExist: boolean = false
  approvalRequestForm!: FormGroup
  fileList: NzUploadFile[] = []
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private projectApprovalService: ProjectApprovalService,
    private projectCharterService: ProjectCharterService,
    private messageService: NzMessageService,
    private nzModalRef: NzModalRef
  ) {
    this.projectId = this.nzModalData.projectId
  }

  ngOnInit() {
    this.getProjectCharter()

    this.approvalRequestForm = this.fb.group({
      requestReason: ['', [Validators.required, Validators.maxLength(500)]],
    })
  }

  getProjectCharter(): void {
    this.loading = true
    this.projectCharterService.get(this.projectId).subscribe({
      next: () => {
        this.isProjectCharterExist = true
        this.loading = false
      },
      error: (error) => {
        console.error('Error fetching project charter:', error)
        this.loading = false
      },
    })
  }

  submitRequest(): void {
    if (this.approvalRequestForm.valid) {
      this.uploading = true

      const formData = new FormData()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fileList.forEach((file: any) => {
        formData.append('Documents', file)
      })
      formData.append('Reason', this.approvalRequestForm.get('requestReason')?.value)
      this.projectApprovalService.requestApproval(this.projectId, formData).subscribe({
        next: (response) => {
          console.log(response)
          this.messageService.success('Yêu cầu phê duyệt đã được gửi')
          this.projectApprovalService.refreshApproval$.next(true)
          this.uploading = false
          this.nzModalRef.close()
        },
        error: (error) => {
          console.error('Error requesting approval:', error)
          this.projectApprovalService.refreshApproval$.next(true)
          this.messageService.error(error.error)
          this.uploading = false
        },
      })
    }
  }

  //before upload function
  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file)
    return false
  }
}
