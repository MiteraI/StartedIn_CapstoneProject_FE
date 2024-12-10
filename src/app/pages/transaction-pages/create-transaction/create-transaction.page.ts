import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from 'src/app/services/transaction.service';
import { ProjectService } from 'src/app/services/project.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { TransactionType } from 'src/app/shared/enums/transaction-type.enum';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service';

@Component({
  selector: 'app-create-transaction',
  templateUrl: './create-transaction.page.html',
  styleUrls: ['./create-transaction.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzRadioModule,
    NzButtonModule
  ]
})
export class CreateTransactionPage implements OnInit {
  transactionForm!: FormGroup;
  projectId!: string;
  members: any[] = [];
  selectedFile: File | null = null;
  isSubmitting = false;
  vndCurrencyPipe = new VndCurrencyPipe();

  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,'');

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private projectService: ProjectService,
    private roleService: RoleInTeamService,
    private notification: NzNotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.roleService.role$.subscribe(role => {
      if (!role || role !== TeamRole.LEADER) {
        this.router.navigate(['../'], { relativeTo: this.route });
        return;
      }
    });

    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;
      this.projectId = params.get('id')!;
      this.loadMembers();
    });

    this.transactionForm = this.fb.group({
      fromId: [''],
      fromName: [''],
      toId: [''],
      toName: [''],
      amount: [10000000, [Validators.required, Validators.min(1000)]],
      isInFlow: [false, Validators.required],
      content: ['', Validators.required]
    });
  }

  loadMembers() {
    this.projectService.getMembers(this.projectId).subscribe(members => {
      this.members = members;
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submit() {
    if (!this.transactionForm.valid || !this.selectedFile) {
      Object.values(this.transactionForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsTouched();
        }
      });
      if (!this.selectedFile) {
        this.notification.error('Lỗi', 'Vui lòng chọn chứng từ');
      }
      return;
    }

    this.isSubmitting = true;

    const transaction = {
      ...this.transactionForm.value,
      type: TransactionType.OTHER
    };

    this.transactionService.createTransaction(this.projectId, transaction)
      .subscribe(response => {
        this.transactionService.uploadEvidence(response.id, this.projectId, this.selectedFile!)
          .subscribe(() => {
            this.notification.success('Thành công', 'Tạo giao dịch thành công');
            this.router.navigate(['../transactions'], { relativeTo: this.route });
          });
      });
  }
}
