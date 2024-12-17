import { Component, inject, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { MeetingService } from 'src/app/services/meeting.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'

@Component({
  selector: 'app-meeting-create-modal',
  templateUrl: './meeting-create-modal.component.html',
  styleUrls: ['./meeting-create-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NzButtonModule, NzFormModule, NzInputModule, NzModalModule, NzSelectModule, NzDatePickerModule, NzSkeletonModule, NzIconModule],
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
      meetingLink: ['', [Validators.required, urlValidator()]],
    })
  }

  ngOnInit() {
    if (!this.nzModalData.appendMode) {
      this.loading = true
      this.milestoneService.getMilestones(this.nzModalData.projectId, 1, 10).subscribe({
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

    // Sanitize the meeting link
    const meetingLink = this.meetingForm.get('meetingLink')?.value
    if (meetingLink) {
      const sanitizedLink = this.getBaseURL(meetingLink)
      this.meetingForm.patchValue({ meetingLink: sanitizedLink })
    }

    this.modalService.confirm({
      nzTitle: 'Xác nhận',
      nzContent: 'Bạn có chắc chắn muốn tạo cuộc họp này?',
      nzOnOk: () => {
        this.nzModalData.appendMode ? this.appendMeeting() : this.createMeeting()
      },
    })
  }

  createMeeting() {
    this.meetingService.createMeeting(this.nzModalData.projectId, this.meetingForm.value).subscribe({
      next: () => {
        this.antdNoti.openSuccessNotification('Thành công', 'Tạo cuộc họp thành công')
        this.meetingService.refreshMeeting$.next(true)
        this.nzModalRef.close()
      },
      error: (err) => {
        console.error('Error:', err)
        this.antdNoti.openErrorNotification('Thất bại', err.error)
      },
    })
  }

  appendMeeting() {
    const meetingData = this.meetingForm.value
    this.nzModalRef.close(meetingData)
  }

  disabledDate = (current: Date): boolean => {
    // Can only select today or future dates
    return current && current < new Date()
  }

  closeModal() {
    this.nzModalRef.close()
  }

  // Utility function to extract base URL
  private getBaseURL(url: string): string {
    try {
      const parsedUrl = new URL(url)
      return `${parsedUrl.origin}${parsedUrl.pathname}`
    } catch (error) {
      console.error('Invalid URL:', url)
      return url // Return original if parsing fails
    }
  }
}

// Custom Validator for URLs
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value

    // Allow empty values (optional field)
    if (!value) {
      return null
    }

    // Regular expression for URL validation
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.?%&=]*)?$/

    return urlRegex.test(value) ? null : { invalidUrl: 'The provided input is not a valid URL' }
  }
}
