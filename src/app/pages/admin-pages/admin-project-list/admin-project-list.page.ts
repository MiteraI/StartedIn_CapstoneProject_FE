import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { catchError, Subject, takeUntil, throwError } from 'rxjs';
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { AdminService } from 'src/app/services/admin.service';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { ProjectStatus, ProjectStatusLabels } from 'src/app/shared/enums/project-status.enum';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { ProjectFilterComponent } from 'src/app/components/admin-pages/project-filter/project-filter.component';

interface FilterOptions {
  projectName?: string;
  description?: string;
  leaderFullName?: string;
  projectStatus?: ProjectStatus;
}

@Component({
  selector: 'app-admin-project-list',
  templateUrl: './admin-project-list.page.html',
  styleUrls: ['./admin-project-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzModalModule,
    MatIconModule,
    RouterModule,
    NzPaginationModule,
    NzSpinModule,
    FilterBarComponent,
    ProjectFilterComponent
  ]
})
export class AdminProjectListPage implements OnInit, OnDestroy {
  @ViewChild('filterComponent') filterComponent!: ProjectFilterComponent;

  projects: ProjectModel[] = [];
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;
  filter: FilterOptions = {};

  projectStatus = ProjectStatus;
  statusLabels = ProjectStatusLabels;

  isLoading = false;
  isDesktopView = false;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: NzModalService,
    private viewMode: ViewModeConfigService,
    private scrollService: ScrollService,
    private adminService: AdminService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.viewMode.isDesktopView$.subscribe(isDesktop => {
      this.isDesktopView = isDesktop;
    });

    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadMore();
      });

    this.fetchProjects();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchProjects(append: boolean = false) {
    this.isLoading = true;
    this.adminService
      .getProjectList(this.pageIndex, this.pageSize)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách dự án thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        this.projects = append ? [...this.projects, ...response.data] : response.data;
        this.totalRecords = response.total;
        this.isLoading = false;
      });
  }

  verifyProject(project: ProjectModel) {
    this.modalService.confirm({
      nzTitle: 'Xác nhận dự án',
      nzContent: 'Bạn có chắc chắn muốn xác nhận dự án này?',
      nzOkText: 'Xác nhận',
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.adminService
          .verifyProject(project.id)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Xác nhận dự án thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => project.projectStatus = ProjectStatus.ACTIVE);
      }
    });
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.fetchProjects();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchProjects();
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords;
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.fetchProjects(true);
  }

  get filterData() {
    return {
      ...this.filter
    };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.pageIndex = 1;
    this.fetchProjects();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      projectName: searchText
    };
    this.pageIndex = 1;
    this.fetchProjects();
  }
}
