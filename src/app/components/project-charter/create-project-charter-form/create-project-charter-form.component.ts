import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { ProjectCharterFormModel } from 'src/app/shared/models/project-charter/project-charter-create.model'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { PhaseState, PhaseStateLabels } from 'src/app/shared/enums/phase-status.enum'
import { CommonModule } from '@angular/common'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { catchError, tap } from 'rxjs'
import { ActivatedRoute, Router } from '@angular/router'
import { NzTableModule } from 'ng-zorro-antd/table'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { Milestone, ProjectCharter } from 'src/app/shared/models/project-charter/project-charter.model'
import { NzModalService, NzModalModule } from 'ng-zorro-antd/modal'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { ViewMilestoneModalComponent } from '../view-milestone-modal/view-milestone-modal.component'
import { ProjectCharterUpdateModel } from 'src/app/shared/models/project-charter/project-charter-update.model'
import { NzNotificationService } from 'ng-zorro-antd/notification'
@Component({
  selector: 'app-create-project-charter-form',
  templateUrl: './create-project-charter-form.component.html',
  styleUrls: ['./create-project-charter-form.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatIcon, ReactiveFormsModule, CommonModule, NzTableModule, NzButtonModule, NzModalModule, NzIconModule],
})
export class CreateProjectCharterFormComponent implements OnInit {
  isLoading = true
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
    private notification: NzNotificationService
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
      listMilestoneCreateDto: this.formBuilder.array([]),
    })
  }

  getPhaseLabel(phaseEnum: number): string {
    const phase = this.phaseStates.find((state) => state.value === phaseEnum)
    return phase ? phase.label : 'Unknown'
  }

  get listMilestoneCreateDto() {
    return this.projectCharterForm.get('listMilestoneCreateDto') as FormArray
  }

  ngOnInit() {
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
    const milestoneForm = this.formBuilder.group({
      milstoneTitle: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      phaseEnum: [0, Validators.required],
    })
    this.listMilestoneCreateDto.push(milestoneForm)
    this.cdr.detectChanges()
  }

  createProjectCharter() {
    if (this.projectCharterForm.invalid) {
      console.log('Form is invalid')
      return
    }
    const projectCharterRequest: ProjectCharterFormModel = this.projectCharterForm.getRawValue()

    projectCharterRequest.listMilestoneCreateDto.forEach((milestone) => {
      milestone.phaseEnum = Number(milestone.phaseEnum)
    })

    this.projectCharterService
      .create(this.projectId, projectCharterRequest)
      .pipe(
        tap((response) => {
          this.notification.success('Thành công', 'Tạo điều lệ dự án thành công', { nzDuration: 2000 })
        }),
        catchError((error) => {
          this.notification.error('Thành công', 'Tạo điều lệ dự án thất bại', { nzDuration: 2000 })
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
          this.mapMilestonesToFormArray(projectCharter.milestones)
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

  mapMilestonesToFormArray(milestones: Milestone[]) {
    milestones.forEach((milestone) => {
      this.listMilestoneCreateDto.push(
        this.formBuilder.group({
          milstoneTitle: [milestone.title, Validators.required],
          description: [milestone.description, Validators.required],
          dueDate: [milestone.dueDate, Validators.required],
          phaseEnum: [milestone.phaseName, Validators.required],
        })
      )
    })
  }

  showConfirmDelete(index: number) {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn xóa cột mốc này không</i>',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => {
        this.listMilestoneCreateDto.removeAt(index)
        this.projectCharterForm.setControl('listMilestoneCreateDto', this.formBuilder.array(this.listMilestoneCreateDto.controls))
      },
    })
  }

  openDetailModal(index: number) {
    const milestone = this.listMilestoneCreateDto.at(index).value
    console.log(milestone)

    this.modal.create({
      nzTitle: 'Milestone Details',
      nzContent: ViewMilestoneModalComponent,
      // pass data to modal
      nzData: {
        milestoneData: milestone,
      },
      nzFooter: null, // Use this to hide default footer buttons if not needed
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
