import { Component, inject, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPostDetails } from 'src/app/shared/models/recruitment/recruitment-post-details.model'
import { NzImage, NzImageModule, NzImageService } from 'ng-zorro-antd/image'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { RecruitmentApplyDialogComponent } from '../recruitment-apply-dialog/recruitment-apply-dialog.component'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { finalize } from 'rxjs'
import { CommonModule } from '@angular/common'

interface IModalData {
  projectId: string
  recruitmentId: string
  previewMode: boolean
}

@Component({
  selector: 'app-recruitment-details-dialog',
  templateUrl: './recruitment-details-dialog.component.html',
  styleUrls: ['./recruitment-details-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, NzAvatarModule, NzImageModule, NzButtonModule, NzModalModule, NzSpinModule],
})
export class RecruitmentDetailsDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  post: RecruitmentPostDetails = {} as RecruitmentPostDetails
  isLoading = true
  get newestTime() {
    // if last updated time is newer than created time, return last updated time
    return this.post.lastUpdatedTime > this.post.createdTime ? this.post.lastUpdatedTime : this.post.createdTime
  }

  private nzImageService = inject(NzImageService)
  constructor(private recruitmentService: RecruitmentService, private modalService: NzModalService) {}

  openRecruitmentApplyDialog() {
    this.modalService.create({
      nzTitle: 'Đơn Tham Gia Nhóm',
      nzContent: RecruitmentApplyDialogComponent,
      nzFooter: null,
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzData: {
        projectId: this.post.projectId,
        recruitmentId: this.post.id,
      },
    })
  }

  onClickPreview(): void {
    this.nzImageService.preview(
      this.post.recruitmentImgs.map((img) => {
        return { src: img.imageUrl, alt: img.fileName } as NzImage
      })
    )
  }

  ngOnInit() {
    if (!this.nzModalData.previewMode) {
      this.recruitmentService
        .getTeamRecruitmentPostDetail(this.nzModalData.recruitmentId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((post) => {
          this.post = post
        })
    } else {
      this.recruitmentService
        .getProjectRecruitmentPost(this.nzModalData.projectId)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe((post) => {
          this.post = post as RecruitmentPostDetails
          this.post.projectId = this.nzModalData.projectId
        })
    }
  }
}
