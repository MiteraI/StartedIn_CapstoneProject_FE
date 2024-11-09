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
  formData: FormData = new FormData()

  constructor(private fb: FormBuilder, private datePipe: DatePipe, private messageService: NzMessageService, private projectService: ProjectService) {
    this.projectForm = this.fb.group({
      projectName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      logoFile: [null, [Validators.required]],
      totalShares: [0],
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
      const formattedStartDate = this.datePipe.transform(this.projectForm.get('startDate')?.value, 'yyyy-MM-dd')
      const formattedEndDate = this.datePipe.transform(this.projectForm.get('endDate')?.value, 'yyyy-MM-dd')

      this.formData.append('ProjectName', this.projectForm.get('projectName')?.value)
      this.formData.append('Description', this.projectForm.get('description')?.value)
      this.formData.append('LogoFile', this.projectForm.get('logoFile')?.value)
      this.formData.append('TotalShares', this.projectForm.get('totalShares')!.value)
      if (formattedStartDate) {
        this.formData.append('StartDate', formattedStartDate)
      }
      if (formattedEndDate) {
        this.formData.append('EndDate', formattedEndDate)
      }

      // console log the form data
      for (let pair of (this.formData as any).entries()) {
        console.log(`${pair[0]}: ${pair[1]}`)
      }
      this.projectService.createProject(this.formData).subscribe({
        next: (response) => {
          this.messageService.success('Project created successfully')
        },
        error: (error) => {
          this.messageService.error('error', error.error)
          console.error('Error creating project', error)
        },
      })
    }
  }
}
