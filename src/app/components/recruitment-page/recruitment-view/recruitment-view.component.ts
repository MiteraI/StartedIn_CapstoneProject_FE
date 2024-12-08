import { Component, OnInit } from '@angular/core'
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

@Component({
  selector: 'app-recruitment-view',
  templateUrl: './recruitment-view.component.html',
  styleUrls: ['./recruitment-view.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzUploadModule, MatIconModule, NzButtonModule, ReactiveFormsModule, NzSwitchModule, NzTagModule],
})
export class RecruitmentViewComponent implements OnInit {
  recruitmentForm: FormGroup
  // fileList for upload related to ngZorro
  fileList: NzUploadFile[] = []

  // recruitmentFileList for display related to recruitment post
  recruitmentFileList: RecruitmentImage[] = []

  projectId = ''
  recruitmentId = ''
  isUpdating = false
  isCreateMode = true

  constructor(private fb: FormBuilder, private activatedRoute: ActivatedRoute, private antdNoti: AntdNotificationService, private recruitmentService: RecruitmentService) {
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
          console.log(this.recruitmentFileList)
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
              },
            })
          },
          error: (err) => {
            this.antdNoti.openErrorNotification('', 'Đã có lỗi xảy ra')
          },
        })
      } else {
        this.recruitmentService.updateRecruitmentPost(this.projectId, { ...this.recruitmentForm.value }).subscribe({
          next: (res) => {
            this.antdNoti.openSuccessNotification('', 'Cập nhật bài tuyển dụng thành công')
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

  ngOnInit() {
    this.activatedRoute.parent?.paramMap.subscribe((value) => {
      this.projectId = value.get('id')!
    })
    this.recruitmentService.getProjectRecruitmentPost(this.projectId).subscribe({
      next: (res) => {
        this.isCreateMode = false
        //map res to form
        this.recruitmentForm.setValue({
          title: res.title,
          content: res.content,
          isOpen: res.isOpen,
          files: [],
        })
        this.recruitmentFileList = res.recruitmentImgs
        this.recruitmentId = res.id
      },
      error: (err) => {
        this.isCreateMode = true
      },
    })
  }
}
