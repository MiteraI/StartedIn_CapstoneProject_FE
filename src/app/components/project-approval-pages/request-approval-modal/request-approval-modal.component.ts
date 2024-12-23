import { CommonModule, DatePipe, PercentPipe } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { ProjectApprovalService } from 'src/app/services/project-approval.service'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { UserService } from 'src/app/services/user.service'
import { ProjectCharter } from 'src/app/shared/models/project-charter/project-charter.model'
import { FullProfile } from 'src/app/shared/models/user/full-profile.model'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'

@Component({
  selector: 'app-request-approval-modal',
  templateUrl: './request-approval-modal.component.html',
  styleUrls: ['./request-approval-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule,
    CommonModule,
    NzIconModule,
    NzUploadModule,
    NzButtonModule,
    NzInputModule,
    NzSkeletonModule, 
    VndCurrencyPipe,
    NzFormModule,
    NzInputNumberModule,
    NzDatePickerModule],
  providers: [PercentPipe,DatePipe],
})
export class RequestApprovalModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  loading = false
  uploading = false
  currentUser: FullProfile | undefined

  projectId: string
  isProjectCharterExist: boolean = false
  approvalRequestForm!: FormGroup
  fileList: NzUploadFile[] = []
  remainingEquityShare: number = 0

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private projectApprovalService: ProjectApprovalService,
    private projectCharterService: ProjectCharterService,
    private messageService: NzMessageService,
    private nzModalRef: NzModalRef,
    private datePipe: DatePipe
  ) {
    this.projectId = this.nzModalData.projectId
  }

  ngOnInit() {
    this.getProjectCharter()

    this.getCurrentUser()

    this.approvalRequestForm = this.fb.group({
      requestReason: ['', [Validators.required, Validators.maxLength(500)]],
      valuePerPercentage: [1000, [Validators.required]],
      equityShareCall: [1, [Validators.required]],
      endDate: [null, [Validators.required]]
    })
    this.remainingEquityShare = this.nzModalData.currentProject.remainingPercentOfShares
  }

  

  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe()
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value)
  vndParser = (value: string) => value.replace(/\D/g, '') // remove all non-digits
  
  formatterPercent = (value: number): string => `${value} %`
  parserPercent = (value: string): string => value.replace(' %', '')

  getCurrentUser() {
    this.userService.getFullProfile().subscribe({
      next: (user) => {
        this.currentUser = user
        console.log('Current user:', user)
      },
      error: (error) => {
        console.error('Error fetching current user:', error)
      },
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

  disabledEndDate = (current: Date): boolean => {
    const today = new Date(); // Lấy ngày hiện tại
    today.setHours(0, 0, 0, 0); // Đặt giờ, phút, giây về 0 để so sánh chính xác
    return current < today; // Vô hiệu hóa ngày hôm nay và tất cả các ngày trước
  }

  submitRequest(): void {
    if (this.approvalRequestForm.valid) {
      this.uploading = true
      let endDate = this.approvalRequestForm.value.endDate
      if (endDate) {
        endDate = this.datePipe.transform(endDate, 'yyyy-MM-dd')
      }
      const formData = new FormData()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.fileList.forEach((file: any) => {
        formData.append('Documents', file)
      })
      formData.append('Reason', this.approvalRequestForm.get('requestReason')?.value)
      formData.append('ValuePerPercentage', this.approvalRequestForm.get('valuePerPercentage')?.value);
      formData.append('EquityShareCall', this.approvalRequestForm.get('equityShareCall')?.value);
      formData.append('EndDate', endDate || null);
      
      this.projectApprovalService.requestApproval(this.projectId, formData).subscribe({
        next: (response) => {
          console.log(response)
          this.messageService.success('Yêu cầu phê duyệt đã được gửi')
          this.uploading = false
          this.nzModalRef.close()
        },
        error: (error) => {
          console.error('Error requesting approval:', error)
          this.messageService.error(error.error)
          this.uploading = false
        },
      })
    }
  }

  getTotalAmount(): number {
    const valuePerPercentage = this.approvalRequestForm.get('valuePerPercentage')?.value || 0;
    const equityShareCall = this.approvalRequestForm.get('equityShareCall')?.value || 0;
    return valuePerPercentage * equityShareCall;
  }

  //before upload function
  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file)
    return false
  }
}
