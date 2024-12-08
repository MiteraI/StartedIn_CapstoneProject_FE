import { Component, inject, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPostDetails } from 'src/app/shared/models/recruitment/recruitment-post-details.model'
import { NzImageModule } from 'ng-zorro-antd/image'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { RecruitmentApplyDialogComponent } from '../recruitment-apply-dialog/recruitment-apply-dialog.component'

interface IModalData {
  projectId: string
  previewMode: boolean
}

@Component({
  selector: 'app-recruitment-details-dialog',
  templateUrl: './recruitment-details-dialog.component.html',
  styleUrls: ['./recruitment-details-dialog.component.scss'],
  standalone: true,
  imports: [NzAvatarModule, NzImageModule, NzButtonModule, NzModalModule],
})
export class RecruitmentDetailsDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  post: RecruitmentPostDetails = {} as RecruitmentPostDetails

  constructor(private recruitmentService: RecruitmentService, private modalService: NzModalService) {}

  openRecruitmentApplyDialog() {
    this.modalService.create({
      nzTitle: 'Đơn Tham Gia Nhóm',
      nzContent: RecruitmentApplyDialogComponent,
      nzFooter: null,
      nzStyle: { top: '20vh' },
      nzBodyStyle: { padding: '0px' },
      nzData: {
        projectId: this.post.projectId,
        recruitmentId: this.post.id,
      },
    })
  }

  ngOnInit() {
    //In backend, the recruitmentId on FE is actually projectId, there is currently no way to get recruitment details by recruitmentId
    this.recruitmentService.getTeamRecruitmentPostDetail(this.nzModalData.projectId).subscribe((data) => {
      this.post = data
    })
  }
}
