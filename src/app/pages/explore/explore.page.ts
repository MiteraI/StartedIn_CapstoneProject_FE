import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError, Subject, takeUntil } from 'rxjs';
import { StartupCardComponent } from 'src/app/components/project-pages/startup-card/startup-card.component';
import { FilterBarComponent } from 'src/app/layouts/filter-bar/filter-bar.component';
import { ProjectService } from 'src/app/services/project.service';
import { StartupModel } from 'src/app/shared/models/project/startup.model';
import { ScrollService } from 'src/app/core/util/scroll.service';
import { StartupFilterComponent } from 'src/app/components/project-pages/startup-filter/startup-filter.component';
import { InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum';
import { NzSpinModule } from 'ng-zorro-antd/spin';

interface FilterOptions {
  projectName?: string;
  status?: InvestmentCallStatus;
  targetFrom?: number;
  targetTo?: number;
  raisedFrom?: number;
  raisedTo?: number;
  availableShareFrom?: number;
  availableShareTo?: number;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    StartupCardComponent,
    CommonModule,
    FilterBarComponent,
    RouterModule,
    StartupFilterComponent,
    NzSpinModule
  ],
  templateUrl: 'explore.page.html',
  styleUrls: ['explore.page.scss']
})
export class InvestorExploreProjectsPage implements OnInit, OnDestroy {
  projects: StartupModel[] = [];
  filter: FilterOptions = {};

  pageIndex: number = 1;
  pageSize: number = 15;
  totalRecords: number = 100;

  isLoading = false;
  isDesktopView = false;

  @ViewChild(StartupFilterComponent) filterComponent!: StartupFilterComponent;
  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    this.scrollService.scroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadMore());

    this.filterProjects();
  }

  filterProjects(append: boolean = false) {
    this.isLoading = true;
    this.projectService
      .getStartups(
        this.pageIndex,
        this.pageSize,
        this.filter.projectName,
        this.filter.status,
        this.filter.targetFrom,
        this.filter.targetTo,
        this.filter.raisedFrom,
        this.filter.raisedTo,
        this.filter.availableShareFrom,
        this.filter.availableShareTo
      )
      .pipe(
        catchError(error => {
          this.isLoading = false;
          console.log(error);

          this.notification.error("Lỗi", error.error || "Lấy danh sách startup thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => {
        this.projects = append ? [...this.projects, ...result.data] : result.data;
        this.totalRecords = result.total;
        this.isLoading = false;
      });
  }

  get filterData() {
    return { ...this.filter };
  }

  onFilterApplied(filterResult: any) {
    this.filter = {...filterResult};
    this.filterProjects();
  }

  onFilterMenuOpened() {
    this.filterComponent.updateForm(this.filter);
  }

  onSearch(searchText: string) {
    this.filter = {
      ...this.filter,
      projectName: searchText
    };
    this.filterProjects();
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords;
  }

  loadMore(): void {
    if (this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.filterProjects(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
