import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { finalize, tap } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MeetingService } from 'src/app/services/meeting.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'

@Component({
  selector: 'app-meeting-create-modal',
  templateUrl: './meeting-create-modal.component.html',
  styleUrls: ['./meeting-create-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NzButtonModule, NzFormModule, NzInputModule, NzModalModule, NzSelectModule, NzDatePickerModule, NzSkeletonModule],
})
export class MeetingCreateModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  meetingForm: FormGroup
  milestones: Milestone[] = []
  loading = false
  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private modalService: NzModalService,
    private meetingService: MeetingService
  ) {
    this.meetingForm = this.fb.group({
      milestoneId: [''],
      title: ['', [Validators.required]],
      appointmentTime: [this.nzModalData.appointmentTime, [Validators.required]],
      description: [''],
      meetingLink: ['', [Validators.required]],
    })
  }

  ngOnInit() {
    if (!this.nzModalData.appendMode) {
      this.milestoneService
        .getMilestones(this.nzModalData.projectId, 1, 10)
        .pipe(
          tap(() => (this.loading = true)),
          finalize(() => (this.loading = false))
        )
        .subscribe({
          next: (milestones) => {
            this.milestones = milestones.data
            this.meetingForm.patchValue({ milestoneId: this.milestones[0].id })
            console.log(this.meetingForm.value)
            this.loading = false
          },
        })
    }
  }

  submit() {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched()
      return
    }
    this.modalService.confirm({
      nzTitle: 'Xác nhận',
      nzContent: 'Bạn có chắc chắn muốn tạo cuộc họp này?',
      nzOnOk: () => {
        this.nzModalData.appendMode ? this.appendMeeting() : this.createMeeting()
        this.meetingService.refreshMeeting$.next(true)
        this.nzModalRef.close()
      },
    })
  }

  createMeeting() {
    this.meetingService.createMeeting(this.nzModalData.projectId, this.meetingForm.value).subscribe({
      next: () => {
        this.antdNoti.openSuccessNotification('Thành công', 'Tạo cuộc họp thành công')
      },
      error: () => {
        this.antdNoti.openErrorNotification('Thất bại', 'Tạo cuộc họp thất bại')
      },
    })
  }

  appendMeeting() {
    const meetingData = this.meetingForm.value
    this.nzModalRef.close(meetingData)
  }
}
