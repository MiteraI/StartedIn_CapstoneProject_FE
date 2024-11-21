import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { CreateMilestone } from 'src/app/shared/models/milestone/milestone-create.model'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-create-milestone-modal',
  templateUrl: './create-milestone-modal.component.html',
  styleUrls: ['./create-milestone-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule, NzSelectModule, NzIconModule],
})
export class CreateMilestoneModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  milestoneForm: FormGroup

  phaseNames: { label: string; value: number }[] = [
    { value: 0, label: PhaseStateLabels[1] },
    { value: 1, label: PhaseStateLabels[2] },
    { value: 2, label: PhaseStateLabels[3] },
    { value: 3, label: PhaseStateLabels[4] },
  ]

  constructor(private fb: FormBuilder, private milestoneService: MilestoneService, private nzModalRef: NzModalRef, private antdNoti: AntdNotificationService) {
    this.milestoneForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    })
  }

  onSubmit() {
    if (this.milestoneForm.valid) {
      //Create milestone object with start and end date with only date part and no time part
      const milestone: CreateMilestone = {
        title: this.milestoneForm.value.title,
        description: this.milestoneForm.value.description,
        startDate: new Date(this.milestoneForm.value.startDate).toISOString().split('T')[0],
        endDate: new Date(this.milestoneForm.value.endDate).toISOString().split('T')[0],
      }

      //If start date is after end date, show error notification
      if (new Date(milestone.startDate) > new Date(milestone.endDate)) {
        this.antdNoti.openErrorNotification('Ngày bắt đầu không thể sau ngày kết thúc', '')
        return
      }

      this.milestoneService.createMilestone(this.nzModalData.projectId, milestone).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Tạo Cột Mốc Thành Công', '')
          this.nzModalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 403) {
            this.antdNoti.openErrorNotification('Không thể tạo cột mốc', 'Bạn không có quyền tạo cột mốc cho dự án này')
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  ngOnInit() {}
}
