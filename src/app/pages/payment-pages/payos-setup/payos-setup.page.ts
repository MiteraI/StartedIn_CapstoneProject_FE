import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectService } from 'src/app/services/project.service';
import { PayosInfoModel } from 'src/app/shared/models/project/payos-info.model';
import { catchError, throwError } from 'rxjs';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-payos-setup',
  templateUrl: './payos-setup.page.html',
  styleUrls: ['./payos-setup.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ]
})
export class PayosSetupPage implements OnInit {
  payosForm!: FormGroup;
  projectId!: string;
  showKeys: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private roleService: RoleInTeamService,
    private location: Location
  ) {}

  ngOnInit() {
    this.projectId = this.route.parent?.snapshot.paramMap.get('id')!;

    this.payosForm = this.fb.group({
      clientKey: ['', Validators.required],
      apiKey: ['', Validators.required],
      checksumKey: ['', Validators.required]
    });

    // Check if user is leader
    this.roleService.role$.subscribe(role => {
      if (role && role !== TeamRole.LEADER) {
        this.router.navigate(['/projects', this.projectId]);
        return;
      }

      this.initializeForm();
    });
  }

  private initializeForm() {
    // Load existing PayOS info if available
    this.projectService.getPayosInfo(this.projectId)
      .pipe(
        catchError(error => {
          if (error.status !== 404 && error.status !== 401) {
            this.notification.error('Lỗi', error.error || 'Không thể tải thông tin PayOS', { nzDuration: 2000 });
          }
          return throwError(() => error);
        })
      )
      .subscribe((payosInfo: PayosInfoModel) => {
        this.payosForm.patchValue(payosInfo);
      });
  }

  onSubmit() {
    if (this.payosForm.valid) {
      const payosInfo: PayosInfoModel = this.payosForm.value;
      this.isLoading = true;
      this.projectService.updatePayosInfo(this.projectId, payosInfo)
        .pipe(
          catchError(error => {
            this.isLoading = false;
            this.notification.error('Lỗi', error.error || 'Cập nhật thông tin PayOS thất bại', { nzDuration: 2000 });
            return throwError(() => error);
          })
        )
        .subscribe(() => {
          this.isLoading = false;
          this.notification.success('Thành công', 'Đã cập nhật thông tin PayOS', { nzDuration: 2000 });
        });
    }
  }

  navigateBack() {
    this.location.back()
  }
}
