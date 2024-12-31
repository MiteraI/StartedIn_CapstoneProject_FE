import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NZ_MODAL_DATA, NzModalModule, NzModalRef } from 'ng-zorro-antd/modal'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { ContractService } from 'src/app/services/contract.service'
import { TerminationRequestService } from 'src/app/services/termination-request.service'
import { TerminationRequestModel } from 'src/app/shared/models/termination-request/termination-request.model'

interface IModalData {
  projectId: string,
  contractId?: string,
  request?: TerminationRequestModel
}

@Component({
  selector: 'app-terminate-meeting-modal',
  templateUrl: './terminate-meeting-modal.component.html',
  styleUrls: ['./terminate-meeting-modal.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzModalModule,
    NzDatePickerModule,
    CommonModule,
    MatIconModule
  ],
})
export class TerminateMeetingModalComponent implements OnInit {
  data: IModalData = inject(NZ_MODAL_DATA);
  meetingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private notification: NzNotificationService,
    private nzModalRef: NzModalRef,
    private terminationRequestService: TerminationRequestService,
    private contractService: ContractService
  ) { }

  ngOnInit() {
    this.meetingForm = this.fb.group({
      title: ['', [Validators.required]],
      appointmentTime: ['', [Validators.required]],
      description: [''],
      meetingLink: ['', [Validators.required, urlValidator()]],
    });
  }

  submit() {
    if (this.meetingForm.invalid) {
      this.meetingForm.markAllAsTouched();
      return;
    }

    // Sanitize the meeting link
    const meetingLink = this.meetingForm.get('meetingLink')?.value;
    if (meetingLink) {
      const sanitizedLink = this.getBaseURL(meetingLink);
      this.meetingForm.patchValue({ meetingLink: sanitizedLink });
    }

    if (this.data.contractId) {
      this.contractService
        .createTerminateMeeting(this.data.projectId, this.data.contractId, this.meetingForm.value)
        .subscribe({
          next: () => {
            this.notification.success('Thành công', 'Tạo cuộc họp thành công', { nzDuration: 2000 });
            this.nzModalRef.close(true);
          },
          error: (error) => {
            this.notification.error('Lỗi', error.error, { nzDuration: 2000 });
          },
        });
    } else if (this.data.request) {
      this.terminationRequestService
        .accept(this.data.projectId, this.data.request.id, this.meetingForm.value)
        .subscribe({
          next: () => {
            this.notification.success('Thành công', 'Tạo cuộc họp thành công', { nzDuration: 2000 });
            this.nzModalRef.close(true);
          },
          error: (error) => {
            this.notification.error('Lỗi', error.error, { nzDuration: 2000 });
          },
        });
    }
  }

  disabledDate = (current: Date): boolean => {
    // Can only select today or future dates
    return current && current < new Date(new Date().setHours(0, 0, 0, 0));
  }

  closeModal() {
    this.nzModalRef.close();
  }

  // Utility function to extract base URL
  private getBaseURL(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return `${parsedUrl.origin}${parsedUrl.pathname}`;
    } catch (error) {
      return url; // Return original if parsing fails
    }
  }
}

// Custom Validator for URLs
export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow empty values (optional field)
    if (!value) {
      return null;
    }

    // Regular expression for URL validation
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.?%&=]*)?$/;

    return urlRegex.test(value) ? null : { invalidUrl: 'The provided input is not a valid URL' };
  }
}
