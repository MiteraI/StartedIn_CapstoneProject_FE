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
import { Subject, takeUntil } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseService } from 'src/app/services/phase.service'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { CreateMilestone } from 'src/app/shared/models/milestone/milestone-create.model'
import { Phase } from 'src/app/shared/models/phase/phase.model'

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
  private destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private nzModalRef: NzModalRef,
    private phaseService: PhaseService,
    private antdNoti: AntdNotificationService
  ) {
    this.milestoneForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      phase: [null],
    })
  }

  phases: Phase[] = []
  isPhasesFetched: boolean = false
  isPhasesFetchLoading = false

  handleOpenPhasesSelect() {
    if (!this.isPhasesFetched) {
      // Fetch milestones
      this.isPhasesFetched = true
      this.fetchPhases()
    }
  }

  loadMorePhases() {
    this.fetchPhases()
  }

  onSubmit() {
    if (this.milestoneForm.valid) {
      //Create milestone object with start and end date with only date part and no time part
      const milestone: CreateMilestone = {
        title: this.milestoneForm.value.title,
        description: this.milestoneForm.value.description,
        startDate: new Date(this.milestoneForm.value.startDate).toISOString().split('T')[0],
        endDate: new Date(this.milestoneForm.value.endDate).toISOString().split('T')[0],
        phaseId: this.milestoneForm.value.phase,
      }

      //If start date is after end date, show error notification
      if (new Date(milestone.startDate) > new Date(milestone.endDate)) {
        this.antdNoti.openErrorNotification('Ngày bắt đầu không thể sau ngày kết thúc', '')
        return
      }

      this.milestoneService.createMilestone(this.nzModalData.projectId, milestone).subscribe({
        next: (response) => {
          this.antdNoti.openSuccessNotification('Tạo Cột Mốc Thành Công', '')
          this.milestoneService.refreshMilestone$.next(true)
          this.nzModalRef.close()
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 403) {
            this.antdNoti.openErrorNotification('Không thể tạo cột mốc', 'Bạn không có quyền tạo cột mốc cho dự án này')
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
            console.error('', error)
          }
        },
      })
    }
  }

  private fetchPhases() {
    this.isPhasesFetchLoading = true
    this.phaseService
      .getPhases(this.nzModalData.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (val) => {
          this.phases = [...this.phases, ...val]
          this.isPhasesFetchLoading = false
        },
        error: (error: HttpErrorResponse) => {
          this.isPhasesFetchLoading = false
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
  }

  ngOnInit() {}
}
