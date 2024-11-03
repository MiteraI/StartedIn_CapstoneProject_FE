import { Component, Input, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProjectCharterFormModel } from 'src/app/shared/models/project-charter/project-charter-create.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import {
  PhaseState,
  PhaseStateLabels,
} from 'src/app/shared/enums/phase-status.enum';
@Component({
  selector: 'app-create-project-charter-form',
  templateUrl: './create-project-charter-form.component.html',
  styleUrls: ['./create-project-charter-form.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatFormFieldModule, MatIcon, ReactiveFormsModule],
})
export class CreateProjectCharterFormComponent implements OnInit {
  @Input() projectId: string | undefined;
  minDate = new Date().toISOString().split('T')[0];
  projectCharterForm: FormGroup;

  // phaseStates = [
  //   { label: 'Initializing', value: 0 },
  //   { label: 'Planning', value: 1 },
  //   { label: 'Executing', value: 2 },
  //   { label: 'Closing', value: 3 },
  // ];
  phaseStates = Object.keys(PhaseState)
    .filter((key) => !isNaN(Number(PhaseState[key as any]))) // Filters out non-numeric keys
    .map((key) => ({
      value: PhaseState[key as keyof typeof PhaseState],
      label: PhaseStateLabels[PhaseState[key as keyof typeof PhaseState]],
    }));

  constructor(private formBuilder: FormBuilder) {
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
    });
  }
  get listMilestoneCreateDto() {
    return this.projectCharterForm.get('listMilestoneCreateDto') as FormArray;
  }

  addMilestone() {
    const milestoneForm = this.formBuilder.group({
      milstoneTitle: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      phaseEnum: [0, Validators.required],
    });
    this.listMilestoneCreateDto.push(milestoneForm);
  }
  removeMilestone(index: number) {
    this.listMilestoneCreateDto.removeAt(index);

    this.projectCharterForm.setControl(
      'listMilestoneCreateDto',
      this.formBuilder.array(this.listMilestoneCreateDto.controls)
    );
  }
  ngOnInit() {
    console.log(this.projectId);
    this.addMilestone();
  }

  onSubmit() {
    if (this.projectCharterForm.invalid) {
      console.log('Form is invalid');
      return;
    }
    const projectCharterRequest: ProjectCharterFormModel =
      this.projectCharterForm.getRawValue();
    projectCharterRequest.projectId = this.projectId!;

    console.log(projectCharterRequest);
  }
}
