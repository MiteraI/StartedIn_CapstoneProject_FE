import { Component, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { NzSwitchModule } from 'ng-zorro-antd/switch'
import { RecruitmentService } from 'src/app/services/recruitment.service'
import { ActivatedRoute } from '@angular/router'
import { RecruitmentImage } from 'src/app/shared/models/recruitment/recruitment-image.model'
import { NzTagModule } from 'ng-zorro-antd/tag'
import { HttpErrorResponse } from '@angular/common/http'
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal'
import { RecruitmentDetailsDialogComponent } from '../../find-team-page/recruitment-details-dialog/recruitment-details-dialog.component'
import { ApplicantListDialogComponent } from '../applicant-list-dialog/applicant-list-dialog.component'
import { EditorComponent, EditorModule } from '@tinymce/tinymce-angular'
import { RecruitmentPostDetailsComponent } from '../../find-team-page/recruitment-post-details/recruitment-post-details.component'
import { EDITOR_KEY } from 'src/app/shared/constants/editor-key.constants'
import { ViewModeConfigService } from 'src/app/core/config/view-mode-config.service'
import { finalize, Subject, takeUntil } from 'rxjs'
import { CommonModule } from '@angular/common'
import { NzCollapseModule } from 'ng-zorro-antd/collapse'
import { Applicant } from 'src/app/shared/models/recruit-invite/applicant.model'
import { RecruitInviteService } from 'src/app/services/recruit-invite.service'
import { NzTableModule } from 'ng-zorro-antd/table'
import { ApplicationStatus, ApplicationStatusColors, ApplicationStatusLabels } from 'src/app/shared/enums/application-status.enum'
import { DateDisplayPipe } from 'src/app/shared/pipes/date-display.pipe'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzTabsModule } from 'ng-zorro-antd/tabs'

@Component({
  selector: 'app-recruitment-view',
  templateUrl: './recruitment-view.component.html',
  styleUrls: ['./recruitment-view.component.scss'],
  standalone: true,
  imports: [
    NzFormModule,
    NzUploadModule,
    MatIconModule,
    NzButtonModule,
    ReactiveFormsModule,
    NzSwitchModule,
    NzTagModule,
    NzModalModule,
    EditorModule,
    RecruitmentPostDetailsComponent,
    CommonModule,
    NzTableModule,
    NzIconModule,
    DateDisplayPipe,
    NzTabsModule,
  ],
})
export class RecruitmentViewComponent implements OnInit, OnDestroy {
  recruitmentForm: FormGroup
  init: EditorComponent['init'] = {
    branding: false,
    plugins: 'lists link code help wordcount image',
    toolbar: 'undo redo | formatselect | bold italic | bullist numlist outdent indent | help',
    setup: () => {
      this.onInfoChange()
    },
  }
  // fileList for upload related to ngZorro
  fileList: NzUploadFile[] = []

  // recruitmentFileList for display related to recruitment post
  recruitmentFileList: RecruitmentImage[] = []

  // to init the application table
  isCollapseOpen = false
  isCollapseEverOpened = false
  applicantList: Applicant[] = []
  isApplicantTableLoading = false
  applicationStatus = ApplicationStatusLabels
  expandSet = new Set<string>()
  onExpandChange(id: string, checked: boolean): void {
    if (checked) {
      this.expandSet.add(id)
    } else {
      this.expandSet.delete(id)
    }
  }
  getStatusColor(status: ApplicationStatus): string {
    return ApplicationStatusColors[status]
  }

  projectId = ''
  recruitmentId = ''
  triggerPostDetailsReload = 0
  isUpdating = false
  isCreateMode = true
  editorKey = EDITOR_KEY
  isDesktopView = true
  destroy$ = new Subject<void>()

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private antdNoti: AntdNotificationService,
    private recruitmentService: RecruitmentService,
    private recruitInviteService: RecruitInviteService,
    private modalService: NzModalService,
    private viewMode: ViewModeConfigService
  ) {
    this.recruitmentForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      isOpen: [false],
      files: [[]],
    })
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.recruitmentForm.get('files')?.setErrors(null)
    this.fileList = this.fileList.concat(file)
    return false
  }

  removeUpload = (file: NzUploadFile): boolean => {
    if (this.fileList.length <= 1) {
      this.recruitmentForm.get('files')?.setErrors({ emptyList: true })
    }
    return true
  }

  uploadAttachment() {
    // Get file from taskForm and forEach to upload
    this.fileList.forEach((file) => {
      this.recruitmentService.uploadImage(this.projectId, file).subscribe({
        next: (res) => {
          this.antdNoti.openSuccessNotification('', 'Tải lên tệp đính kèm thành công')
          // Remove this file from the fileList
          this.fileList = this.fileList.filter((f) => f.uid !== file.uid)
          this.recruitmentFileList.push(res)
          this.triggerPostDetailsReload++
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.antdNoti.openErrorNotification('', error.error)
          } else if (error.status === 500) {
            this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
          } else {
          }
        },
      })
    })
  }

  deleteAttachment(imageId: string) {
    this.recruitmentService.deleteImage(this.projectId, imageId).subscribe({
      next: (res) => {
        this.antdNoti.openSuccessNotification('', 'Xóa tệp đính kèm thành công')
        this.recruitmentFileList = this.recruitmentFileList.filter((a) => a.id !== imageId)
        this.triggerPostDetailsReload++
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 400) {
          this.antdNoti.openErrorNotification('', error.error)
        } else if (error.status === 500) {
          this.antdNoti.openErrorNotification('Lỗi', 'Đã xảy ra lỗi, vui lòng thử lại sau')
        } else {
        }
      },
    })
  }

  onInfoChange() {
    this.isUpdating = true
  }

  onCollapseOpen() {
    if (this.isCollapseEverOpened === false) {
      this.recruitInviteService
        .getRecruitmentApplications(this.projectId)
        .pipe(finalize(() => (this.isApplicantTableLoading = false)))
        .subscribe((applicants) => {
          this.applicantList = applicants
        })
      this.isCollapseEverOpened = true
    }
  }

  acceptApplicant(applicant: string) {
    this.recruitInviteService.acceptApplication(this.projectId, applicant).subscribe({
      next: (res: any) => {
        this.antdNoti.openSuccessNotification('', res)
        this.applicantList = this.applicantList.filter((a) => a.id !== applicant)
      },
      error: (err) => {
        this.antdNoti.openErrorNotification('', err.error)
      },
    })
  }

  rejectApplicant(applicant: string) {
    this.recruitInviteService.rejectApplication(this.projectId, applicant).subscribe({
      next: (res: any) => {
        this.antdNoti.openSuccessNotification('', res)
        this.applicantList = this.applicantList.filter((a) => a.id !== applicant)
      },
      error: (err) => {
        this.antdNoti.openErrorNotification('', err.error)
      },
    })
  }

  onSubmit() {
    if (this.recruitmentForm.valid) {
      if (this.isCreateMode) {
        this.recruitmentService.createRecruitmentPost(this.projectId, { ...this.recruitmentForm.value, files: this.fileList }).subscribe({
          next: (res) => {
            this.antdNoti.openSuccessNotification('', 'Tạo bài tuyển dụng thành công')
            this.recruitmentService.getProjectRecruitmentPost(this.projectId).subscribe({
              next: (res) => {
                //TODO: add loading
                this.isCreateMode = false
                this.recruitmentId = res.id
                //Set time out 1000ms to trigger post details reload
                setTimeout(() => {
                  this.triggerPostDetailsReload++
                }, 1000)
              },
            })
            this.triggerPostDetailsReload++
          },
          error: (err) => {
            this.antdNoti.openErrorNotification('', 'Đã có lỗi xảy ra')
          },
        })
      } else {
        this.recruitmentService.updateRecruitmentPost(this.projectId, { ...this.recruitmentForm.value }).subscribe({
          next: (res) => {
            this.antdNoti.openSuccessNotification('', 'Cập nhật bài tuyển dụng thành công')
            this.triggerPostDetailsReload++
          },
          error: (err) => {
            this.antdNoti.openErrorNotification('', 'Đã có lỗi xảy ra')
          },
        })
      }
    } else {
      this.antdNoti.openErrorNotification('', 'Vui lòng nhập đầy đủ thông tin')
    }
  }

  openRecruitmentDetailsPreview() {
    this.modalService.create({
      nzTitle: 'Chi Tiết Bài Đăng',
      nzContent: RecruitmentDetailsDialogComponent,
      nzFooter: null,
      nzStyle: { top: '20px' },
      nzBodyStyle: { padding: '0px', height: '80vh' },
      nzData: {
        projectId: this.projectId,
        previewMode: true, //inside project
      },
    })
  }

  openApplicantListDialog() {
    this.modalService.create({
      nzTitle: 'Danh Sách Ứng Tuyển',
      nzContent: ApplicantListDialogComponent,
      nzFooter: null,
      nzStyle: { top: '20px', width: 'auto', maxWidth: '98vw' },
      nzBodyStyle: { padding: '0px' },
      nzData: {
        projectId: this.projectId,
      },
      nzWidth: 'fit-content',
    })
  }

  ngOnInit() {
    this.activatedRoute.parent?.paramMap.pipe(takeUntil(this.destroy$)).subscribe((value) => {
      this.projectId = value.get('id')!
    })
    this.recruitmentService.getProjectRecruitmentPost(this.projectId).subscribe({
      next: (res) => {
        this.isCreateMode = false
        //map res to form
        this.recruitmentForm.setValue(
          {
            title: res.title,
            content: res.content,
            isOpen: res.isOpen,
            files: [],
          },
          { emitEvent: false }
        )
        this.recruitmentFileList = res.recruitmentImgs
        this.recruitmentId = res.id
      },
      error: (err) => {
        this.isCreateMode = true
      },
    })

    this.viewMode.isDesktopView$.pipe(takeUntil(this.destroy$)).subscribe((isDesktop) => {
      this.isDesktopView = isDesktop
    })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
