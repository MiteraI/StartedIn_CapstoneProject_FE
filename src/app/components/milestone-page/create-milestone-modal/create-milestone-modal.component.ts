import { HttpErrorResponse } from '@angular/common/http'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzTableModule } from 'ng-zorro-antd/table'
import { Subject, takeUntil } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { PhaseService } from 'src/app/services/phase.service'
import { PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { MeetingCreateModel } from 'src/app/shared/models/meeting/meeting-create.model'
import { CreateMilestone } from 'src/app/shared/models/milestone/milestone-create.model'
import { Phase } from 'src/app/shared/models/phase/phase.model'
import { MeetingCreateModalComponent } from '../../meeting-page/meeting-create-modal/meeting-create-modal.component'
import { CommonModule } from '@angular/common'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-create-milestone-modal',
  templateUrl: './create-milestone-modal.component.html',
  styleUrls: ['./create-milestone-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule, NzSelectModule, NzIconModule, NzTableModule, MatIconModule, NzModalModule, CommonModule],
})
export class CreateMilestoneModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  milestoneForm: FormGroup
  addingMeeting: MeetingCreateModel[] = []
  private destroy$ = new Subject<void>()

  expandSet = new Set<string>()
  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id)
    } else {
      this.expandSet.delete(id)
    }
  }

  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private nzModalRef: NzModalRef,
    private phaseService: PhaseService,
    private antdNoti: AntdNotificationService,
    private modalService: NzModalService
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

  openCreateMeetingModal() {
    const modalRef = this.modalService.create({
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '16px' },
      nzContent: MeetingCreateModalComponent,
      nzTitle: 'Tạo Cuộc Họp',
      nzData: {
        projectId: this.nzModalData.projectId,
        appendMode: true,
      },
      nzFooter: null,
    })

    modalRef.afterClose.subscribe((result: MeetingCreateModel) => {
      if (result) {
        this.addingMeeting = [...this.addingMeeting, result]
      }
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
        phaseId: this.milestoneForm.value.phase ? this.milestoneForm.value.phase : null,
        meetingList: this.addingMeeting,
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
