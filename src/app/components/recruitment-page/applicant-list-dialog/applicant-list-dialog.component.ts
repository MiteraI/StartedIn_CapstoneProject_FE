import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDividerModule } from 'ng-zorro-antd/divider'
import { NZ_MODAL_DATA, NzModalModule } from 'ng-zorro-antd/modal'
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'
import { Applicant } from 'src/app/shared/models/recruit-invite/applicant.model'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-applicant-list-dialog',
  templateUrl: './applicant-list-dialog.component.html',
  styleUrls: ['./applicant-list-dialog.component.scss'],
  standalone: true,
  imports: [NzTableModule, NzDividerModule, NzButtonModule, CommonModule, NzPopconfirmModule, NzTagModule],
})
export class ApplicantListDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)

  applicantList: Applicant[] = []

  constructor(private recruitInviteService: RecruitInviteService, private antdNoti: AntdNotificationService) {}

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
    this.recruitInviteService.getRecruitmentApplications(this.nzModalData.projectId).subscribe((applicants) => {
      this.applicantList = applicants
    })
  }
}
