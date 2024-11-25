import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { FullProfile } from 'src/app/shared/models/user/full-profile.model';
import { ImportUsersModalComponent } from 'src/app/components/admin-pages/import-users-modal/import-users-modal.component';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.page.html',
  styleUrls: ['./admin-user-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzAvatarModule,
    NzModalModule,
    MatIconModule,
    RouterModule,
    NzPaginationModule,
    NzSpinModule,
    InitialsOnlyPipe
  ]
})
export class AdminUserListPage implements OnInit, OnDestroy {
  users: FullProfile[] = [];
  pageIndex: number = 1;
  pageSize: number = 20;
  totalRecords: number = 200;

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

    this.fetchUsers();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchUsers(append: boolean = false) {
    this.isLoading = true;
    this.adminService
      .getUserList(this.pageIndex, this.pageSize)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Lấy danh sách người dùng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        this.users = append ? [...this.users, ...response.data] : response.data;
        this.totalRecords = response.total;
        this.isLoading = false;
      });
  }

  deleteUser(userId: string) {
    this.modalService.confirm({
      nzTitle: 'Xóa người dùng',
      nzContent: 'Bạn có chắc chắn muốn xóa người dùng này?',
      nzOkText: 'Xóa',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzCancelText: 'Hủy',
      nzOnOk: () => {
        this.adminService
          .deleteUser(userId)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Xóa người dùng thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(() => {
            this.fetchUsers();
            this.notification.success("Thành công", "Xóa người dùng thành công!", { nzDuration: 2000 });
          });
      }
    });
  }

  onPageIndexChange(index: number) {
    this.pageIndex = index;
    this.fetchUsers();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.pageIndex = 1;
    this.fetchUsers();
  }

  get isEndOfList(): boolean {
    return this.pageIndex * this.pageSize >= this.totalRecords;
  }

  loadMore(): void {
    if (this.isDesktopView || this.isLoading || this.isEndOfList) return;

    this.pageIndex++;
    this.fetchUsers(true);
  }

  openImportModal() {
    const modalRef = this.modalService.create({
      nzTitle: 'Import Người Dùng',
      nzContent: ImportUsersModalComponent,
      nzFooter: null,
      nzWidth: 500
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.fetchUsers();
      }
    });
  }
}
