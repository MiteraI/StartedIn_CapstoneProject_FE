import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { CommonModule } from '@angular/common'
import { ProjectCharterService } from '../../../services/project-charter.service'
import { ActivatedRoute } from '@angular/router'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { ProjectCharter } from '../../../shared/models/project-charter/project-charter.model'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { CreateCharterModalComponent } from '../create-charter-modal/create-charter-modal.component'
import { UpdateCharterModalComponent } from '../update-charter-modal/update-charter-modal.component'
import { Subject, takeUntil } from 'rxjs'
@Component({
  selector: 'app-project-charter-details',
  templateUrl: './project-charter-details.component.html',
  styleUrls: ['./project-charter-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, MatIconModule, NzSpinModule, NzSkeletonModule, NzCollapseModule, NzModalModule],
})
export class ProjectCharterDetailsComponent implements OnInit, OnDestroy {
  isLoading = false
  isCharterExist = false
  isEditable = true
  projectCharter: ProjectCharter | undefined
  $destroy = new Subject<void>()

  @Input() isOverview = false
  @Input({ required: true }) ProjectId: string = ''
  constructor(private projectCharterService: ProjectCharterService, private route: ActivatedRoute, private modal: NzModalService, private messageService: NzMessageService) {}
  ngOnDestroy(): void {
    this.$destroy.next()
    this.$destroy.complete()
  }

  ngOnInit() {
    this.isLoading = true
    this.getProjectCharter()
  }

  getProjectCharter() {
    this.projectCharterService.refreshCharter$.pipe(takeUntil(this.$destroy)).subscribe(() => {
      this.isLoading = true
      this.projectCharterService.get(this.ProjectId).subscribe({
        next: (response) => {
          this.projectCharter = response as ProjectCharter
          if (this.projectCharter) {
            this.isLoading = false
            this.isCharterExist = true
          }
        },
        error: (error) => {
          // this.messageService.error(error.error)
          this.isLoading = false
        },
      })
    })
  }

  //open Edit Charter Modal
  toggleEdit() {
    const modalRef = this.modal.create({
      nzTitle: 'Sửa Tuyên Ngôn Dự Án',
      nzWidth: '50%',
      nzContent: UpdateCharterModalComponent,
      nzData: { projectCharter: this.projectCharter },
      nzFooter: null,
    })
  }

  //Open Create Charter Modal
  toggleCreate() {
    const modalRef = this.modal.create({
      nzTitle: 'Tạo Tuyên Ngôn Dự Án',
      nzWidth: '70%',
      nzContent: CreateCharterModalComponent,
      nzData: { projectId: this.ProjectId },
      nzFooter: null,
    })
  }
}
