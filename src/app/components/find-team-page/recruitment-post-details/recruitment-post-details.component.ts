import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core'
import { finalize, Subject, take, takeUntil, tap } from 'rxjs'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPostDetails } from 'src/app/shared/models/recruitment/recruitment-post-details.model'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzImage, NzImageModule, NzImageService } from 'ng-zorro-antd/image'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NZ_MODAL_DATA, NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { CommonModule } from '@angular/common'
import { RecruitmentApplyDialogComponent } from '../recruitment-apply-dialog/recruitment-apply-dialog.component'

@Component({
  selector: 'app-recruitment-post-details',
  templateUrl: './recruitment-post-details.component.html',
  styleUrls: ['./recruitment-post-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NzSpinModule, NzAvatarModule, NzImageModule, NzButtonModule, NzModalModule],
})
export class RecruitmentPostDetailsComponent implements OnInit, OnDestroy {
  @Input({ required: true })
  set currentPostId(postId: string) {
    if (postId) {
      this.fetchPostDetails(postId)
    }
  }
  @Input() isDesktopView: boolean = true
  @Input() isPreview: boolean = false

  postDetails: RecruitmentPostDetails = {} as RecruitmentPostDetails

  get newestTime() {
    // if last updated time is newer than created time, return last updated time
    return this.postDetails.lastUpdatedTime > this.postDetails.createdTime ? this.postDetails.lastUpdatedTime : this.postDetails.createdTime
  }

  isLoading = true

  destroy$ = new Subject<void>()

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
        projectId: this.postDetails.projectId,
        recruitmentId: this.postDetails.id,
      },
    })
  }

  onClickPreview(): void {
    this.nzImageService.preview(
      this.postDetails.recruitmentImgs.map((img) => {
        return { src: img.imageUrl, alt: img.fileName } as NzImage
      })
    )
  }

  fetchPostDetails(postId: string) {
    this.recruitmentService
      .getTeamRecruitmentPostDetail(postId)
      .pipe(
        tap((val) => {
          this.postDetails = val
        }),
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }

  ngOnInit() {}

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
