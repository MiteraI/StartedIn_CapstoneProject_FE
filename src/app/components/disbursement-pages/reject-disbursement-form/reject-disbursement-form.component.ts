import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-reject-disbursement-form',
  templateUrl: './reject-disbursement-form.component.html',
  styleUrls: ['./reject-disbursement-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule
  ]
})
export class RejectDisbursementFormComponent implements OnInit {
  rejectForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.rejectForm = this.fb.group({
      reason: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
}
