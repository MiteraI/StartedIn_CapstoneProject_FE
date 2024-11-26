import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzMessageService } from 'ng-zorro-antd/message'
import { CommonModule, DatePipe } from '@angular/common'
import { ProjectService } from 'src/app/services/project.service'
import { NzModalRef } from 'ng-zorro-antd/modal'

@Component({
  selector: 'app-project-create-modal',
  templateUrl: './project-create-modal.component.html',
  styleUrls: ['./project-create-modal.component.scss'],
  standalone: true,
  imports: [NzIconModule, NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, CommonModule, NzButtonModule],
  providers: [DatePipe],
})
export class ProjectCreateModalComponent implements OnInit {
  dateFormat = 'dd-MM-yyyy'
  selectedFile: File | null = null
  previewUrl: string | ArrayBuffer | null = null
  projectForm: FormGroup

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private messageService: NzMessageService, private projectService: ProjectService, private modalRef: NzModalRef) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      logoFile: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null],
    })
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement

    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0]
      this.projectForm.get('logoFile')?.setValue(this.selectedFile)
      // Preview the selected image
      const reader = new FileReader()
      reader.onload = () => {
        this.previewUrl = reader.result
      }
      reader.readAsDataURL(this.selectedFile)
    } else {
      this.previewUrl = null
    }
  }

  ngOnInit() {}

  onSubmit() {
    if (this.projectForm.valid) {
      const formData = new FormData()

      formData.append('ProjectName', this.projectForm.get('projectName')?.value)
      formData.append('Description', this.projectForm.get('description')?.value)
      formData.append('LogoFile', this.selectedFile!)

      const formattedStartDate = this.datePipe.transform(this.projectForm.get('startDate')?.value, 'yyyy-MM-dd')
      const formattedEndDate = this.datePipe.transform(this.projectForm.get('endDate')?.value, 'yyyy-MM-dd')
      if (formattedStartDate) {
        formData.append('StartDate', formattedStartDate)
      }
      if (formattedEndDate) {
        formData.append('EndDate', formattedEndDate)
      }

      // console log the form data
      for (let pair of (formData as any).entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
      }
      this.projectService.createProject(formData).subscribe({
        next: (response) => {
          this.messageService.success('Project created successfully')
          this.projectService.refreshProject$.next(true)
          this.modalRef.close()
        },
        error: (error) => {
          this.messageService.error(error.error)
          console.error('Error creating project', error.error)
          this.projectService.refreshProject$.next(true)
          this.modalRef.close()
        },
      })
    }
  }
}
