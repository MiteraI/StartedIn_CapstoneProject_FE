import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzCardModule } from 'ng-zorro-antd/card'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { RecruitmentPost } from 'src/app/shared/models/recruitment/recruitment-post.model'
import { RecruitmentDetailsDialogComponent } from '../recruitment-details-dialog/recruitment-details-dialog.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-recruitment-post-card',
  templateUrl: './recruitment-post-card.component.html',
  styleUrls: ['./recruitment-post-card.component.scss'],
  standalone: true,
  imports: [CommonModule, NzCardModule, NzAvatarModule, NzTagModule, NzModalModule],
})
export class RecruitmentPostCardComponent implements OnInit {
  @Input({ required: true }) recruitmentPost: RecruitmentPost = {} as RecruitmentPost
  @Input() currrrentPostId: string = ''
  @Output() onPostSelected = new EventEmitter<string>()

  get newestTime() {
    // if last updated time is newer than created time, return last updated time
    return this.recruitmentPost.lastUpdatedTime > this.recruitmentPost.createdTime ? this.recruitmentPost.lastUpdatedTime : this.recruitmentPost.createdTime
  }

  get isSelected(): boolean {
    if (this.currrrentPostId === '') return false    
    return this.recruitmentPost.id === this.currrrentPostId
  }

  constructor(private modalService: NzModalService) {}

  postSelected() {
    this.onPostSelected.emit(this.recruitmentPost.id)
  }

  ngOnInit() {}
}
