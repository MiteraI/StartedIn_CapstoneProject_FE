import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { ProjectCardComponent } from 'src/app/components/investor-explore-projects/project-card/project-card.component';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { ProjectService } from 'src/app/services/project.service';
import { ExploreProjectsListItemModel } from 'src/app/shared/models/project/explore-projects-list-item.model';
import { SearchResponseModel } from 'src/app/shared/models/search-response.model';

@Component({
  selector: 'app-investor-explore-projects',
  standalone: true,
  imports: [ProjectCardComponent, CommonModule, FilterBarComponent],
  templateUrl: 'investor-explore-projects.page.html',
  styleUrls: ['investor-explore-projects.page.scss']
})

export class InvestorExploreProjectsPage implements OnInit {
  projects: SearchResponseModel<ExploreProjectsListItemModel> = {
    responseList: [],
    pageIndex: 1,
    pageSize: 15,
    totalPage: 0,
    totalRecord: 0
  };

  constructor(
    private projectService: ProjectService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.projectService
      .getProjectsToExplore(1, 15)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách dự án thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => this.projects = response);
  }

  //TODO filter stuff
}
