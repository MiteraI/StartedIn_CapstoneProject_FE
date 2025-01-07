import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FullProfile } from 'src/app/shared/models/user/full-profile.model';
import { MatIconModule } from '@angular/material/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { UpdateProfileModalComponent } from 'src/app/components/user-pages/update-profile-modal/update-profile-modal.component';
import { UserService } from 'src/app/services/user.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { catchError, throwError } from 'rxjs';
import { UpdatePhotoModalComponent } from 'src/app/components/user-pages/update-photo-modal/update-photo-modal.component';
import { NzUploadFile } from 'ng-zorro-antd/upload';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzAvatarModule,
    InitialsOnlyPipe,
    NzButtonModule,
    NzModalModule
  ]
})
export class ProfilePage implements OnInit {
  profile!: FullProfile;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalService: NzModalService,
    private userService: UserService,
    private notification: NzNotificationService
  ) { }

  ngOnInit() {
    this.profile = this.route.snapshot.data['profile'];
    if (!this.profile) {
      this.router.navigate(['/']);
    }
  }

  openUpdateModal(): void {
    const modalRef = this.modalService.create({
      nzContent: UpdateProfileModalComponent,
      nzData: this.profile,
      nzFooter: null,
      nzWidth: 500
    });

    modalRef.afterClose.subscribe(result => {
      if (result) {
        this.userService
          .editProfile(result.bio, result.phoneNumber)
          .pipe(
            catchError(error => {
              this.notification.error('Lỗi', error.error || 'Không thể cập nhật thông tin. Vui lòng thử lại sau.');
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(updatedProfile => {
              this.profile = updatedProfile;
            this.notification.success('Thành công', 'Cập nhật thông tin thành công');
          });
      }
    });
  }

  openUpdatePhotoModal(type: 'profile' | 'cover'): void {
    const modalRef = this.modalService.create({
      nzContent: UpdatePhotoModalComponent,
      nzData: { type },
      nzFooter: null,
      nzWidth: 500
    });

    modalRef.afterClose.subscribe((file: NzUploadFile) => {
      if (file) {
        const uploadMethod = type === 'profile'
          ? this.userService.uploadProfilePicture(file as any)
          : this.userService.uploadCoverPhoto(file as any);

        uploadMethod.pipe(
          catchError(error => {
            this.notification.error('Lỗi', error.error || 'Không thể cập nhật ảnh. Vui lòng thử lại sau.', { nzDuration: 2000 });
            return throwError(() => new Error(error));
          })
        ).subscribe(url => {
          if (type === 'profile') {
            this.profile.profilePicture = url;
          } else {
            this.profile.coverPhoto = url;
          }
          this.notification.success('Thành công', 'Cập nhật ảnh thành công');
        });
      }
    });
  }
}
