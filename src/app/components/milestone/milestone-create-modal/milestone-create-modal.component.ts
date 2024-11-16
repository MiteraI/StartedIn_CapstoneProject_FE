import { CommonModule } from '@angular/common'
import { Component, inject, Input, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { ActivatedRoute } from '@angular/router'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { MilestoneCreateModel } from 'src/app/shared/models/milestone/milestone-create.model'
import { NzNotificationModule } from 'ng-zorro-antd/notification'
import { AntdNotificationService } from 'src/app/services/antd-notification.service'
import { HttpErrorResponse } from '@angular/common/http'


interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-milestone-create-modal',
  templateUrl: './milestone-create-modal.component.html',
  styleUrls: ['./milestone-create-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, NzFormModule, NzInputModule, NzDatePickerModule, NzButtonModule, NzIconModule, NzSelectModule, ReactiveFormsModule, NzNotificationModule],
})
export class MilestoneCreateModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  milestoneForm!: FormGroup
  projectId!: string
  phaseStates = Object.entries(PhaseStateLabels).map(([value, label]) => ({
    value: Number(value),
    label,
  }))

  constructor(private fb: FormBuilder, private modalRef: NzModalRef, private milestoneService: MilestoneService, private route: ActivatedRoute, private antdNoti: AntdNotificationService) {}

  ngOnInit() {
    this.projectId = this.nzModalData.projectId
    console.log(this.projectId)
    this.milestoneForm = this.fb.group({
      milestoneTitle: ['', [Validators.required]],
      description: ['', [Validators.required]],
      dueDate: [null, [Validators.required]],
      phaseEnum: [null, [Validators.required]],
    })
  }
  closeModal(): void {
    this.modalRef.close()
  }

  onSubmit(): void {
    if (this.milestoneForm.valid) {
      const formattedDueDate = this.milestoneForm.value.dueDate.toISOString().split('T')[0]
      const milestoneData: MilestoneCreateModel = {
        milstoneTitle: this.milestoneForm.value.milestoneTitle,
        description: this.milestoneForm.value.description,
        dueDate: formattedDueDate,
        phaseEnum: this.milestoneForm.value.phaseEnum,
      }
      this.milestoneService.createMilestone(this.projectId, milestoneData).subscribe({
        next: () => {
          this.antdNoti.openSuccessNotification('Created Milestone Successfully', '')
          this.modalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openInfoNotification('Error', 'An error occurred. Please try again later.')
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Server Error', 'An error occurred on the server. Please try again later.')
          } else {
            console.error('Error creating milestone:', error)
          }
        }
      })
    }
  }
}
