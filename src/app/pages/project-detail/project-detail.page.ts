import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { ActivatedRoute } from '@angular/router'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { ProjectService } from 'src/app/services/project.service'
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzMessageService } from 'ng-zorro-antd/message'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.page.html',
  styleUrls: ['./project-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, EditorComponent, EditorModule, ReactiveFormsModule, NzButtonModule, NzModalModule],
})
export class ProjectDetailPage implements OnInit {
  projectId: string = ''
  projectOverview: ProjectOveriewModel | undefined

  projectDetailForm: FormGroup
  projectDetailPost: string = ''
  isUpdating = false
  editorKey = EDITOR_KEY
  init: EditorComponent['init'] = {
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {
      this.onInfoChange()
    },
  }

  isDesktopView = true

  constructor(
    private messageService: NzMessageService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private viewMode: ViewModeConfigService,
    private projectService: ProjectService,
    private modal: NzModalService
  ) {
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })

    this.projectDetailForm = this.formBuilder.group({
      projectDetailPost: [''],
    })
  }

  ngOnInit() {
    this.viewMode.isDesktopView$.subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
    this.projectService.getProjectOverview(this.projectId).subscribe({
      next: (data) => {
        this.projectOverview = data
        this.projectDetailForm.patchValue({
          projectDetailPost: data.projectDetailPost,
        })
      },
      error: (error) => {
        console.error(error)
      },
    })
  }

  onInfoChange() {
    this.isUpdating = true
  }

  onSubmit() {
    console.log(this.projectDetailForm.value)
    this.projectService.editPost(this.projectId, this.projectDetailForm.value.projectDetailPost).subscribe({
      next: (message) => {
        this.messageService.success(message)
        this.isUpdating = false
      },
      error: (error) => {
        console.error(error)
        this.messageService.error(error.error)
        this.isUpdating = false
      },
    })
  }
  onPreview() {
    const content = this.projectDetailForm.value.projectDetailPost

    this.modal.create({
      nzTitle: 'Xem trước miêu tả dự án',
      nzContent: `<div>${content || 'Không có thông tin'}</div>`,
      nzWidth: '80%',
      nzFooter: null,
      nzClosable: true,
    })
  }
}
