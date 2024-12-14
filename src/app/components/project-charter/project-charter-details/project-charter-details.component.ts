import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { PhaseState, PhaseStateLabels } from '../../../shared/enums/phase-status.enum'
import { CommonModule, DatePipe } from '@angular/common'
import { ProjectCharterService } from '../../../services/project-charter.service'
import { ActivatedRoute } from '@angular/router'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { ProjectCharter } from '../../../shared/models/project-charter/project-charter.model'
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzListModule } from 'ng-zorro-antd/list'
import { NzMessageService } from 'ng-zorro-antd/message'
import { ProjectModel } from '../../../shared/models/project/project.model'
import { ProjectService } from '../../../services/project.service'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { CreateCharterModalComponent } from '../create-charter-modal/create-charter-modal.component'
@Component({
  selector: 'app-project-charter-details',
  templateUrl: './project-charter-details.component.html',
  styleUrls: ['./project-charter-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, MatIconModule, NzSpinModule, NzSkeletonModule, NzCollapseModule],
})
export class ProjectCharterDetailsComponent implements OnInit {
  isLoading = false
  isCharterExist = false
  isEditable = true
  projectId = ''
  currentProject: ProjectModel | undefined
  projectCharter: ProjectCharter | undefined

  phaseStates = Object.keys(PhaseState)
    .filter((key) => !isNaN(Number(PhaseState[key as any]))) // Filters out non-numeric keys
    .map((key) => ({
      value: PhaseState[key as keyof typeof PhaseState],
      label: PhaseStateLabels[PhaseState[key as keyof typeof PhaseState]],
    }))

  @Input() ProjectId: string = ''
  constructor(
    private projectCharterService: ProjectCharterService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private messageService: NzMessageService,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.isLoading = true
    this.projectId = this.route.parent?.snapshot.paramMap.get('id')!
    this.getProjectCharter()
    this.getCurrentProject()
  }

  getProjectCharter() {
    this.projectCharterService.get(this.ProjectId).subscribe({
      next: (response) => {
        this.projectCharter = response as ProjectCharter
        console.log(this.projectCharter)
        if (this.projectCharter) {
          this.isLoading = false
          this.isCharterExist = true

          // Disable form if project charter is already created
        }
        this.cdr.detectChanges()
      },

      error: (error) => {
        this.messageService.error(error.error)
        this.isLoading = false
        this.cdr.detectChanges()
      },
    })
  }

  toggleEdit() {
    this.isEditable = !this.isEditable
  }

  saveEdit() {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn lưu thay đổi không?</i>',
      nzOnOk: () => this.updateProjectCharter(),
      nzOnCancel: () => console.log('Cancel'),
    })
  }

  updateProjectCharter() {
    // this.projectCharterService
    //   .edit(this.projectId, projectCharterEditForm)
    //   .pipe(
    //     tap((response) => {
    //       this.notification.success('Thành công', 'Chỉnh sửa điều lệ dự án thành công', { nzDuration: 2000 })
    //       this.toggleEdit()
    //     }),
    //     catchError((error) => {
    //       this.notification.error('Thất bại', 'Chỉnh sửa điều lệ dự án thất bại, xin vui lòng thử lại trong giây lát', { nzDuration: 2000 })
    //       throw error
    //     })
    //   )
    //   .subscribe()
    // console.log(projectCharterEditForm)
  }

  private getCurrentProject() {
    this.projectService.getProject(this.projectId).subscribe({
      next: (response) => {
        this.currentProject = response
        console.log(this.currentProject)
      },
      error: (error) => {
        console.error(error)
      },
    })
  }

  //Open Create Charter Modal
  toggleCreate() {
    const modalRef = this.modal.create({
      nzTitle: 'Tạo Tuyên Ngôn Dự Án',
      nzWidth: '70%',
      nzContent: CreateCharterModalComponent,
      nzData: { projectId: this.projectId },
      nzFooter: null,
    })
  }
}
