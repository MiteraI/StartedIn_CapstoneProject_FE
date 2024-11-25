import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzUploadFile, NzUploadModule } from 'ng-zorro-antd/upload'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'

@Component({
  selector: 'app-recruitment-view',
  templateUrl: './recruitment-view.component.html',
  styleUrls: ['./recruitment-view.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzUploadModule, MatIconModule, ReactiveFormsModule],
})
export class RecruitmentViewComponent implements OnInit {
  recruitmentForm: FormGroup
  fileList: NzUploadFile[] = []

  constructor(private fb: FormBuilder, private antdNoti: AntdNotificationService) {
    this.recruitmentForm = this.fb.group({
      title: [''],
      content: [''],
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

  ngOnInit() {}
}
