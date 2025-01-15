import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { finalize } from 'rxjs'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'
import { ApplicationStatus, ApplicationStatusColors, ApplicationStatusLabels } from 'src/app/shared/enums/application-status.enum'
import { Applicant } from 'src/app/shared/models/recruit-invite/applicant.model'
import { DateDisplayPipe } from 'src/app/shared/pipes/date-display.pipe'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-applicant-list-dialog',
  templateUrl: './applicant-list-dialog.component.html',
  styleUrls: ['./applicant-list-dialog.component.scss'],
  standalone: true,
  imports: [
    NzTableModule,
    NzDividerModule,
    NzButtonModule,
    CommonModule,
    NzPopconfirmModule,
    NzTagModule,
    NzIconModule,
    DateDisplayPipe
  ],
})
export class ApplicantListDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)

  applicantList: Applicant[] = []
  applicationStatus = ApplicationStatusLabels

  loading: boolean = false

  expandSet = new Set<string>()
  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id)
    } else {
      this.expandSet.delete(id)
    }
  }

  constructor(private recruitInviteService: RecruitInviteService, private antdNoti: AntdNotificationService) {}

  getStatusColor(status: ApplicationStatus): string {
    return ApplicationStatusColors[status]
  }

  acceptApplicant(applicant: string) {
    this.recruitInviteService.acceptApplication(this.nzModalData.projectId, applicant).subscribe({
      next: (res: any) => {
        this.antdNoti.openSuccessNotification('', res)
        this.applicantList = this.applicantList.filter((a) => a.id !== applicant)
      },
      error: (err) => {
        this.antdNoti.openErrorNotification('', err.error)
      },
    })
  }

  rejectApplicant(applicant: string) {
    this.recruitInviteService.rejectApplication(this.nzModalData.projectId, applicant).subscribe({
      next: (res: any) => {
        this.antdNoti.openSuccessNotification('', res)
        this.applicantList = this.applicantList.filter((a) => a.id !== applicant)
      },
      error: (err) => {
        this.antdNoti.openErrorNotification('', err.error)
      },
    })
  }

  ngOnInit() {
    this.loading = true
    this.recruitInviteService
      .getRecruitmentApplications(this.nzModalData.projectId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((applicants) => {
        this.applicantList = applicants
      })
  }
}
