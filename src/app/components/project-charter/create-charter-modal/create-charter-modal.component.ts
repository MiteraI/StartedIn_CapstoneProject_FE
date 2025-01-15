import { CommonModule, DatePipe } from '@angular/common'
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { ProjectService } from 'src/app/services/project.service'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { ProjectCharterFormModel } from 'src/app/shared/models/project-charter/project-charter-create.model'
import { ProjectModel } from 'src/app/shared/models/project/project.model'

@Component({
  selector: 'app-create-charter-modal',
  templateUrl: './create-charter-modal.component.html',
  styleUrls: ['./create-charter-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatIconModule, NzDatePickerModule, NzButtonModule, NzInputModule, EditorComponent, EditorModule],
  providers: [DatePipe],
})
export class CreateCharterModalComponent implements OnInit {
  isLoading = false
  isUpdating = false
  projectCharterForm: FormGroup
  projectId: string = ''
  editorKey = EDITOR_KEY
  currentProject: ProjectModel | undefined
  init: EditorComponent['init'] = {
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {
      this.onInfoChange()
    },
  }

  readonly nzModalData = inject(NZ_MODAL_DATA)
  constructor(
    private formBuilder: FormBuilder,
    private modal: NzModalService,
    private datePipe: DatePipe,
    private projectCharterService: ProjectCharterService,
    private messageService: NzMessageService,
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef
  ) {
    this.projectCharterForm = this.formBuilder.group({
      projectId: [''],
      businessCase: ['', Validators.required],
      goal: ['', Validators.required],
      objective: ['', Validators.required],
      scope: ['', Validators.required],
      constraints: ['', Validators.required],
      assumptions: ['', Validators.required],
      deliverables: ['', Validators.required],
      listCreatePhaseDtos: this.formBuilder.array([]),
    })
  }

  ngOnInit() {
    this.projectId = this.nzModalData.projectId
    this.getCurrentProject()
    this.addMilestone()
  }

  onSubmit() {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn tạo tuyên ngôn dự án này không?</i>',
      nzOnOk: () => this.createProjectCharter(),
      nzOnCancel: () => console.log('Cancel'),
    })
  }

  createProjectCharter() {
    this.isLoading = true
    if (this.projectCharterForm.invalid) {
      console.log('Form is invalid')
      return
    }
    const projectCharterRequest: ProjectCharterFormModel = this.projectCharterForm.getRawValue()

    // format the date before call api
    projectCharterRequest.listCreatePhaseDtos.forEach((phase) => {
      projectCharterRequest.listCreatePhaseDtos.forEach((phase) => {
        if (phase.startEndDate && phase.startEndDate.length === 2) {
          phase.startDate = this.datePipe.transform(phase.startEndDate[0], 'yyyy-MM-dd') || ''
          phase.endDate = this.datePipe.transform(phase.startEndDate[1], 'yyyy-MM-dd') || ''
        }
      })
    })

    console.log(projectCharterRequest)

    this.projectCharterService.create(this.projectId, projectCharterRequest).subscribe({
      next: (response) => {
        this.messageService.success('Tạo tuyên ngôn dự án thành công')
        this.modal.closeAll()
      },
      error: (error) => {
        this.messageService.error(error.error)
        this.isLoading = false
        console.error(error)
      },
    })
  }

  get listCreatePhaseDtos() {
    return this.projectCharterForm.get('listCreatePhaseDtos') as FormArray
  }

  showConfirmDelete(index: number) {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn xóa giai đoạn này không</i>',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.listCreatePhaseDtos.removeAt(index)
        this.projectCharterForm.setControl('listCreatePhaseDtos', this.formBuilder.array(this.listCreatePhaseDtos.controls))
      },
    })
  }

  disabledDate = (current: Date): boolean => {
    if (!current) {
      return false
    }

    const startDate = this.currentProject?.startDate ? new Date(this.currentProject.startDate) : null

    if (!startDate) {
      return false // If there's no startDate, do not disable any dates
    }

    // Remove time components from both current and startDate
    const currentWithoutTime = new Date(current.setHours(0, 0, 0, 0))
    const startDateWithoutTime = new Date(startDate.setHours(0, 0, 0, 0))

    // Disable dates before the start date
    return currentWithoutTime < startDateWithoutTime
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

  addMilestone() {
    const phaseForm = this.formBuilder.group({
      phaseName: ['', Validators.required],
      startEndDate: [[null], Validators.required],
    })
    this.listCreatePhaseDtos.push(phaseForm)
    this.cdr.detectChanges()
  }

  onInfoChange() {
    this.isUpdating = true
  }
}
