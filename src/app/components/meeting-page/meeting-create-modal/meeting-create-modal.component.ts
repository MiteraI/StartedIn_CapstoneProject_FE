import { HttpErrorResponse } from '@angular/common/http'
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { DisabledTimeFn, NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef, NzModalService } from 'ng-zorro-antd/modal'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { tap } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { ContractService } from 'src/app/services/contract.service'
import { MeetingService } from 'src/app/services/meeting.service'
import { MilestoneService } from 'src/app/services/milestone.service'
import { ProjectService } from 'src/app/services/project.service'
import { UserService } from 'src/app/services/user.service'
import { TeamRole, TeamRoleLabels } from 'src/app/shared/enums/team-role.enum'
import { ContractListItemModel } from 'src/app/shared/models/contract/contract-list-item.model'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { FullProfile } from 'src/app/shared/models/user/full-profile.model'
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model'

@Component({
  selector: 'app-meeting-create-modal',
  templateUrl: './meeting-create-modal.component.html',
  styleUrls: ['./meeting-create-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, NzButtonModule, NzFormModule, NzInputModule, NzModalModule, NzSelectModule, NzDatePickerModule, NzSkeletonModule, NzIconModule, NzUploadModule],
})
export class MeetingCreateModalComponent implements OnInit {
  readonly nzModalData = inject(NZ_MODAL_DATA)
  meetingForm: FormGroup
  milestones: Milestone[] = []
  contracts: ContractListItemModel[] = []
  currentUser: FullProfile | null = null
  users: TeamMemberModel[] = []
  fileList: NzUploadFile[] = []

  TeamRoleLabels = TeamRoleLabels

  loadingMilestones = false
  loadingContracts = false
  loadingSubmit = false

  constructor(
    private fb: FormBuilder,
    private milestoneService: MilestoneService,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private modalService: NzModalService,
    private meetingService: MeetingService,
    private contractService: ContractService,
    private projectService: ProjectService,
    private userService: UserService
  ) {
    this.meetingForm = this.fb.group({
      milestoneId: [''],
      contractId: [''],
      title: ['', [Validators.required]],
      appointmentTime: [this.nzModalData.appointmentTime, [Validators.required]],
      appointmentEndTime: [this.addOneHour(this.nzModalData.appointmentTime), [Validators.required]],
      description: [''],
      meetingLink: ['', [Validators.required, urlValidator()]],
      parties: [[], [Validators.required]],
    })
  }

  ngOnInit() {
    if (!this.nzModalData.appendMode) {
      this.loadingMilestones = true
      this.loadingContracts = true

      this.milestoneService.getMilestones(this.nzModalData.projectId, 1, 20).subscribe({
        next: (milestones) => {
          this.milestones = milestones.data
          console.log(this.meetingForm.value)
          this.loadingMilestones = false
        },
      })

      this.contractService.getContractListForProject(this.nzModalData.projectId, 1, 20).subscribe({
        next: (contracts) => {
          this.contracts = contracts.data
          this.loadingContracts = false
        },
      })
    }
    // get meeting link
    this.projectService.getProject(this.nzModalData.projectId).subscribe({
      next: (project) => {
        this.meetingForm.patchValue({ meetingLink: project.appointmentUrl })
      },
    })

    //get current user
    this.userService.getFullProfile().subscribe({
      next: (res) => {
        this.currentUser = res
        this.fetchTeamMembers()
      },
    })

    // Subscribe to startTime changes to update endTime
    this.meetingForm.get('appointmentTime')?.valueChanges.subscribe((newStartTime: Date) => {
      this.updateEndTime(newStartTime)
    })
  }

  fetchTeamMembers() {
    // get team members
    this.projectService.getMembers(this.nzModalData.projectId).subscribe({
      next: (res) => {
        this.users = res.filter((u) => u.id !== this.currentUser?.id)
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
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
      nzCancelText: 'Đóng',
      nzOnOk: () => {
        this.nzModalData.appendMode ? this.appendMeeting() : this.createMeeting()
      },
    })
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.fileList = this.fileList.concat(file)
    return false
  }

  createMeeting() {
    this.loadingSubmit = true
    if (this.meetingForm.get('milestoneId')?.value === '') {
      this.meetingForm.patchValue({ milestoneId: null })
    }

    if (this.meetingForm.get('contractId')?.value === '') {
      this.meetingForm.patchValue({ contractId: null })
    }

    const formData = new FormData()

    // Append each form field to the FormData object
    formData.append('MilestoneId', this.meetingForm.get('milestoneId')?.value || '')
    formData.append('ContractId', this.meetingForm.get('contractId')?.value || '')
    formData.append('Title', this.meetingForm.get('title')?.value)
    formData.append('AppointmentTime', this.meetingForm.get('appointmentTime')?.value.toISOString())
    formData.append('AppointmentEndTime', this.meetingForm.get('appointmentEndTime')?.value.toISOString())
    formData.append('Description', this.meetingForm.get('description')?.value || '')
    formData.append('MeetingLink', this.meetingForm.get('meetingLink')?.value)

    // Handle arrays
    const parties = this.meetingForm.get('parties')?.value || []
    parties.forEach((party: string) => {
      formData.append('Parties', party)
    })

    this.fileList.forEach((document: any) => {
      formData.append('Documents', document)
    })

    this.meetingService.createMeeting(this.nzModalData.projectId, formData).subscribe({
      next: () => {
        this.loadingSubmit = false
        this.antdNoti.openSuccessNotification('Thành công', 'Tạo cuộc họp thành công')
        this.meetingService.refreshMeeting$.next(true)
        this.nzModalRef.close()
      },
      error: (err) => {
        this.loadingSubmit = false
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
    // Disable dates before today
    return current && current < new Date(new Date().setHours(0, 0, 0, 0))
  }

  range(start: number, end: number): number[] {
    const result: number[] = []
    for (let i = start; i < end; i++) {
      result.push(i)
    }
    return result
  }

  disabledEndDate = (current: Date): boolean => {
    const startTime = this.meetingForm.get('appointmentTime')?.value
    if (!startTime) return true // Disable all dates until a start time is selected

    const startDateTime = new Date(startTime)
    const currentDateTime = new Date(current)

    // Only allow the same date as start date
    return currentDateTime.toDateString() !== startDateTime.toDateString()
  }

  disabledEndTime: DisabledTimeFn = () => {
    const startTime = this.meetingForm.get('appointmentTime')?.value
    if (!startTime) return { nzDisabledHours: () => [], nzDisabledMinutes: () => [], nzDisabledSeconds: () => [] }

    const startDateTime = new Date(startTime)

    return {
      nzDisabledHours: () => this.range(0, startDateTime.getHours()),
      nzDisabledMinutes: () => {
        if (new Date().getHours() === startDateTime.getHours()) {
          return this.range(0, startDateTime.getMinutes())
        }
        return []
      },
      nzDisabledSeconds: () => {
        if (new Date().getHours() === startDateTime.getHours() && new Date().getMinutes() === startDateTime.getMinutes()) {
          return this.range(0, startDateTime.getSeconds())
        }
        return []
      },
    }
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

  addOneHour(date: Date): Date {
    const newDate = new Date(date)
    newDate.setHours(newDate.getHours() + 1)
    return newDate
  }

  updateEndTime(newStartTime: Date): void {
    const newEndTime = this.addOneHour(newStartTime)
    this.meetingForm.get('appointmentEndTime')?.setValue(newEndTime)
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
