import { Component, Input, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { RecruitmentPost } from 'src/app/shared/models/recruitment/recruitment-post.model'
import { RecruitmentDetailsDialogComponent } from '../recruitment-details-dialog/recruitment-details-dialog.component'

@Component({
  selector: 'app-recruitment-post-card',
  templateUrl: './recruitment-post-card.component.html',
  styleUrls: ['./recruitment-post-card.component.scss'],
  standalone: true,
  imports: [NzCardModule, NzAvatarModule, NzTagModule, NzModalModule],
})
export class RecruitmentPostCardComponent implements OnInit {
  @Input({ required: true }) recruitmentPost: RecruitmentPost = {} as RecruitmentPost
  constructor(private modalService: NzModalService) {}

  openRecruitmentDetailsDialog() {
    this.modalService.create({
      nzTitle: 'Chi Tiết Bài Đăng',
      nzContent: RecruitmentDetailsDialogComponent,
      nzFooter: null,
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px' },
      nzData: {
        projectId: this.recruitmentPost.projectId,
      },
    })
  }

  ngOnInit() {}
}
