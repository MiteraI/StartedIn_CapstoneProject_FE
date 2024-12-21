import { Component, OnDestroy, OnInit } from '@angular/core'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPost } from 'src/app/shared/models/recruitment/recruitment-post.model'
import { RecruitmentPostCardComponent } from '../recruitment-post-card/recruitment-post-card.component'
import { RecruitmentPostDetailsComponent } from '../recruitment-post-details/recruitment-post-details.component'
import { finalize, Subject, takeUntil } from 'rxjs'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { RecruitmentDetailsDialogComponent } from '../recruitment-details-dialog/recruitment-details-dialog.component'
import { ScrollService } from 'src/app/core/util/scroll.service'

@Component({
  selector: 'app-find-team-view',
  templateUrl: './find-team-view.component.html',
  styleUrls: ['./find-team-view.component.scss'],
  standalone: true,
  imports: [RecruitmentPostCardComponent, RecruitmentPostDetailsComponent, NzSpinModule, NzModalModule],
})
export class FindTeamViewComponent implements OnInit, OnDestroy {
  page: number = 1
  size: number = 10
  total: number = 0
  recruitmentPostList: RecruitmentPost[] = []
  currentPostId: string = ''

  get isEndOfList(): boolean {
    return this.page * this.size >= this.total
  }

  isLoading = true
  isDesktopView = true
  destroy$ = new Subject<void>()

  constructor(
    private recruitmentService: RecruitmentService,
    private viewMode: ViewModeConfigService,
    private modalService: NzModalService,
    private scrollService: ScrollService
  ) {}

  loadMore(): void {
    if (this.isLoading || this.isEndOfList) return
    this.page++
    this.fetchRecruitmentPosts()
  }

  onPostSelected(postId: string) {
    if (this.currentPostId === postId) {
      return
    }
    if (this.isDesktopView) {
      this.currentPostId = postId
    } else {
      this.currentPostId = postId
      this.modalService.create({
        nzTitle: 'Chi Tiết Bài Đăng',
        nzContent: RecruitmentDetailsDialogComponent,
        nzFooter: null,
        nzStyle: { top: '20px' },
        nzBodyStyle: { padding: '0px', height: '80vh' },
        nzData: { 
          recruitmentId: this.currentPostId,
          previewMode: false, //outside project
        },
      })
    }
  }

  private fetchRecruitmentPosts() {
    this.recruitmentService
      .getExploreTeamRecruitmentPosts(this.page, this.size)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe((recruitmentPosts) => {
        this.recruitmentPostList = recruitmentPosts.data
        this.currentPostId = this.recruitmentPostList[0].id
        this.total = recruitmentPosts.total
      })
  }

  onScroll(event: any) {
    const element = event.target
    if (element.scrollHeight - element.scrollTop <= element.clientHeight + 100) {
      this.scrollService.emitScroll()
    }
  }

  ngOnInit() {
    this.fetchRecruitmentPosts()
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })

    this.scrollService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadMore()
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
