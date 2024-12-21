import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NZ_MODAL_DATA, NzModalService } from 'ng-zorro-antd/modal'
import { catchError, tap } from 'rxjs'
import { ProjectCharterService } from 'src/app/services/project-charter.service'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { ProjectCharterUpdateModel } from 'src/app/shared/models/project-charter/project-charter-update.model'
import { ProjectCharter } from 'src/app/shared/models/project-charter/project-charter.model'

@Component({
  selector: 'app-update-charter-modal',
  templateUrl:'./update-charter-modal.component.html',
  styleUrls: ['./update-charter-modal.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NzButtonModule, NzInputModule, EditorModule],
})
export class UpdateCharterModalComponent implements OnInit {
  init: EditorComponent['init'] = {
    plugins: 'lists link code help wordcount',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {
      this.onInfoChange()
    },
  }
  projectCharter: ProjectCharter | undefined
  readonly nzModalData = inject(NZ_MODAL_DATA)
  projectCharterForm: FormGroup
  isUpdating = false  
  editorKey = EDITOR_KEY

  constructor(private modal: NzModalService, private formBuilder: FormBuilder, private projectCharterService: ProjectCharterService, private messageService: NzMessageService) {
    this.projectCharter = this.nzModalData.projectCharter

    this.projectCharterForm = this.formBuilder.group({
      businessCase: [this.projectCharter?.businessCase, Validators.required],
      goal: [this.projectCharter?.goal, Validators.required],
      objective: [this.projectCharter?.objective, Validators.required],
      scope: [this.projectCharter?.scope, Validators.required],
      constraints: [this.projectCharter?.constraints, Validators.required],
      assumptions: [this.projectCharter?.assumptions, Validators.required],
      deliverables: [this.projectCharter?.deliverables, Validators.required],
    })
  }

  ngOnInit() {
    console.log(this.projectCharter)
  }

  updateProjectCharter() {
    const projectCharterFormValue = this.projectCharterForm.value as ProjectCharterUpdateModel
    this.projectCharterService
      .edit(this.projectCharter?.projectId!, projectCharterFormValue)
      .pipe(
        tap((response) => {
          this.messageService.success('Chỉnh sửa điều lệ dự án thành công')
        }),
        catchError((error) => {
          this.messageService.error('Chỉnh sửa điều lệ dự án thất bại, xin vui lòng thử lại trong giây lát')
          throw error
        })
      )
      .subscribe()
  }

  saveEdit() {
    this.modal.confirm({
      nzTitle: '<i>Bạn có muốn lưu thay đổi không?</i>',
      nzOnOk: () => {
        this.updateProjectCharter()
        this.modal.closeAll()
      },
      nzOnCancel: () => console.log('Cancel'),
    })
  }

  onInfoChange() {
    this.isUpdating = true
  }
}
