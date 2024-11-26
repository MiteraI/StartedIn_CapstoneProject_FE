import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProjectCharterFormModel } from 'src/app/shared/models/project-charter/project-charter-create.model'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon, MatIconModule } from '@angular/material/icon'
import { PhaseState, PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { CommonModule, DatePipe } from '@angular/common'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { catchError, tap } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { ProjectCharter } from 'src/app/shared/models/project-charter/project-charter.model'
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { ViewMilestoneModalComponent } from '../view-milestone-modal/view-milestone-modal.component'
import { ProjectCharterUpdateModel } from 'src/app/shared/models/project-charter/project-charter-update.model'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { Milestone } from 'src/app/shared/models/milestone/milestone.model'
import { Phase } from 'src/app/shared/models/phase/phase.model'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
@Component({
  selector: 'app-create-project-charter-form',
  templateUrl: './create-project-charter-form.component.html',
  styleUrls: ['./create-project-charter-form.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatIcon,
    ReactiveFormsModule,
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzIconModule,
    MatIconModule,
    NzSpinModule,
    NzDatePickerModule,
  ],
  providers: [DatePipe],
})
export class CreateProjectCharterFormComponent implements OnInit {
  isLoading = false
  isCharterExist = false
  isEditable = true
  projectId = ''
  minDate = new Date().toISOString().split('T')[0]
  projectCharterForm: FormGroup

  phaseStates = Object.keys(PhaseState)
    .filter((key) => !isNaN(Number(PhaseState[key as any]))) // Filters out non-numeric keys
    .map((key) => ({
      value: PhaseState[key as keyof typeof PhaseState],
      label: PhaseStateLabels[PhaseState[key as keyof typeof PhaseState]],
    }))

  constructor(
    private formBuilder: FormBuilder,
    private projectCharterService: ProjectCharterService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private notification: NzNotificationService,
    private datePipe: DatePipe
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

  get listCreatePhaseDtos() {
    return this.projectCharterForm.get('listCreatePhaseDtos') as FormArray
  }

  ngOnInit() {
    this.isLoading = true
    this.projectId = this.route.parent?.snapshot.paramMap.get('id')!
    this.getProjectCharter()
  }

  // Create project charter
  onSubmit() {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn tạo điều lệ này không?</i>',
      nzOnOk: () => this.createProjectCharter(),
      nzOnCancel: () => console.log('Cancel'),
    })
  }

  addMilestone() {
    const phaseForm = this.formBuilder.group({
      phaseName: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    })
    this.listCreatePhaseDtos.push(phaseForm)
    this.cdr.detectChanges()
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
      if (phase.startDate) {
        phase.startDate = this.datePipe.transform(phase.startDate, 'yyyy-MM-dd') || ''
      }
      if (phase.endDate) {
        phase.endDate = this.datePipe.transform(phase.endDate, 'yyyy-MM-dd') || ''
      }
    })

    console.log(projectCharterRequest.listCreatePhaseDtos)

    this.projectCharterService
      .create(this.projectId, projectCharterRequest)
      .pipe(
        tap((response) => {
          this.notification.success('Thành công', 'Tạo điều lệ dự án thành công', { nzDuration: 2000 })
          this.getProjectCharter()
        }),
        catchError((error) => {
          this.notification.error('Thành công', 'Tạo điều lệ dự án thất bại', { nzDuration: 2000 })
          this.getProjectCharter()

          console.error(error)
          throw error
        })
      )
      .subscribe()
  }

  getProjectCharter() {
    this.projectCharterService.get(this.projectId).subscribe({
      next: (response) => {
        const projectCharter = response as ProjectCharter
        if (projectCharter) {
          this.projectCharterForm.patchValue(projectCharter)
          this.mapPhasesToFormArray(projectCharter.phases)
          this.isLoading = false
          this.isCharterExist = true

          // Disable form if project charter is already created
          this.isEditable = false
          this.projectCharterForm.disable()
        }
        this.cdr.detectChanges()
      },

      error: (error) => {
        this.isLoading = false
        this.cdr.detectChanges()
      },
    })
  }

  mapPhasesToFormArray(phases: Phase[]) {
    phases.forEach((phase) => {
      this.listCreatePhaseDtos.push(
        this.formBuilder.group({
          phaseName: [phase.phaseName, Validators.required],
          startDate: [phase.startDate, Validators.required],
          endDate: [phase.endDate, Validators.required],
        })
      )
    })
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

  toggleEdit() {
    this.isEditable = !this.isEditable
    if (this.isEditable) {
      this.projectCharterForm.enable()
    } else {
      this.projectCharterForm.disable()
    }
  }

  saveEdit() {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn lưu thay đổi không?</i>',
      nzOnOk: () => this.updateProjectCharter(),
      nzOnCancel: () => console.log('Cancel'),
    })
  }

  updateProjectCharter() {
    const projectCharterEditForm: ProjectCharterUpdateModel = {
      businessCase: this.projectCharterForm.get('businessCase')?.value,
      goal: this.projectCharterForm.get('goal')?.value,
      objective: this.projectCharterForm.get('objective')?.value,
      scope: this.projectCharterForm.get('scope')?.value,
      constraints: this.projectCharterForm.get('constraints')?.value,
      assumptions: this.projectCharterForm.get('assumptions')?.value,
      deliverables: this.projectCharterForm.get('deliverables')?.value,
    }

    this.projectCharterService
      .edit(this.projectId, projectCharterEditForm)
      .pipe(
        tap((response) => {
          this.notification.success('Thành công', 'Chỉnh sửa điều lệ dự án thành công', { nzDuration: 2000 })
          this.toggleEdit()
        }),
        catchError((error) => {
          this.notification.error('Thất bại', 'Chỉnh sửa điều lệ dự án thất bại, xin vui lòng thử lại trong giây lát', { nzDuration: 2000 })
          throw error
        })
      )
      .subscribe()
    console.log(projectCharterEditForm)
  }
}
