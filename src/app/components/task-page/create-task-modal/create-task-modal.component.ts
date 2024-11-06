import { DatePipe } from '@angular/common'
import { Component, Input } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'

@Component({
  selector: 'app-create-task-modal',
  templateUrl: './create-task-modal.component.html',
  styleUrls: ['./create-task-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule],
  providers: [DatePipe],
})
export class CreateTaskModalComponent {
  @Input({ required: true }) projectId!: string
  taskForm: FormGroup

  constructor(private fb: FormBuilder, private datePipe: DatePipe) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      deadline: [null],
    })
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formattedDeadline = this.datePipe.transform(this.taskForm.value.deadline, 'yyyy-MM-dd HH:00:00')
      console.log(formattedDeadline)
      
      console.log('Task data:', this.taskForm.value)
    } else {
      console.log('Form is invalid')
    }
  }
}
