import { Component, inject, OnInit } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { RecruitmentPostDetails } from 'src/app/shared/models/recruitment/recruitment-post-details.model'
import { NzImageModule } from 'ng-zorro-antd/image'

interface IModalData {
  projectId: string
}

@Component({
  selector: 'app-recruitment-details-dialog',
  templateUrl: './recruitment-details-dialog.component.html',
  styleUrls: ['./recruitment-details-dialog.component.scss'],
  standalone: true,
  imports: [NzAvatarModule, NzImageModule],
})
export class RecruitmentDetailsDialogComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA)
  post: RecruitmentPostDetails = {} as RecruitmentPostDetails

  constructor(private recruitmentService: RecruitmentService) {}

  ngOnInit() {
    this.recruitmentService.getTeamRecruitmentPostDetail(this.nzModalData.projectId).subscribe((data) => {
      this.post = data
    })
  }
}
