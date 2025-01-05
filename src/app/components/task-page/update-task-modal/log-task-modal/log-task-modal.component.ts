import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { TaskService } from 'src/app/services/task.service';
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { RouterModule } from '@angular/router';
import { TaskStatus } from 'src/app/shared/enums/task-status.enum';
import { UserTask } from 'src/app/shared/models/task/user-task.model';

interface IModalData {
  taskId: string;
  projectId: string;
  expectedManHour: number;
  actualManHour: number;
  status: TaskStatus;
  assignees: UserTask[];
  canLogTime: boolean;
}

@Component({
  selector: 'app-log-task-modal',
  templateUrl: './log-task-modal.component.html',
  styleUrls: ['./log-task-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputNumberModule,
    NzButtonModule,
    RouterModule
  ]
})
export class LogTaskModalComponent implements OnInit {
  readonly nzModalData: IModalData = inject(NZ_MODAL_DATA);
  logForm: FormGroup;
  totalHoursLogged: number = 0;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private antdNoti: AntdNotificationService,
    private modalRef: NzModalRef
  ) {
    this.logForm = this.fb.group({
      hours: [0, [Validators.required, Validators.min(0), Validators.max(24)]]
    });
  }

  ngOnInit() {
    this.totalHoursLogged = this.nzModalData.actualManHour;
    console.log(this.nzModalData);

  }

  getHoursDifference(): { value: number; isOver: boolean } {
    const diff = this.totalHoursLogged - this.nzModalData.expectedManHour;
    return {
      value: Math.abs(diff),
      isOver: diff > 0
    };
  }

  onSubmit() {
    if (this.logForm.valid) {
      const hours = this.logForm.get('hours')?.value;
      this.taskService.logTime(this.nzModalData.projectId, this.nzModalData.taskId, hours)
        .subscribe({
          next: () => {
            this.antdNoti.openSuccessNotification('', 'Đã ghi nhận thời gian làm việc');
            this.modalRef.close(true);
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 400) {
              this.antdNoti.openErrorNotification('', error.error);
            } else {
              this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau');
            }
          }
        });
    }
  }
}
