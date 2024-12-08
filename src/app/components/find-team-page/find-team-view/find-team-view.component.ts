import { Component, OnInit } from '@angular/core'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPost } from 'src/app/shared/models/recruitment/recruitment-post.model'
import { RecruitmentPostCardComponent } from '../recruitment-post-card/recruitment-post-card.component'
import { NzImageModule } from 'ng-zorro-antd/image'

@Component({
  selector: 'app-find-team-view',
  templateUrl: './find-team-view.component.html',
  styleUrls: ['./find-team-view.component.scss'],
  standalone: true,
  imports: [RecruitmentPostCardComponent],
})
export class FindTeamViewComponent implements OnInit {
  page = 1
  size = 10
  recruitmentPostList: RecruitmentPost[] = []

  constructor(private recruitmentService: RecruitmentService) {}

  ngOnInit() {
    this.recruitmentService.getExploreTeamRecruitmentPosts(this.page, this.size).subscribe((recruitmentPosts) => {
      this.recruitmentPostList = recruitmentPosts.data
    })
  }
}
