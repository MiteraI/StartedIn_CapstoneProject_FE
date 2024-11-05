import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { DisbursementCreateModel } from 'src/app/shared/models/disbursement/disbursement-create.model';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { IonicModule } from '@ionic/angular';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { InvestmentContractCreateModel } from 'src/app/shared/models/contract/investment-contract-create.model';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { ClickOutsideDirective } from 'src/app/shared/directives/click-outside.directive';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { CreateDisbursementFormComponent } from 'src/app/components/contract-pages/create-disbursement-form/create-disbursement-form.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { catchError, throwError } from 'rxjs';
import { ProjectStatus } from 'src/app/shared/enums/project-status.enum';
import { Location } from '@angular/common';

@Component({
  selector: 'app-create-investment-contract',
  templateUrl: './create-investment-contract.page.html',
  styleUrls: ['./create-investment-contract.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzModalModule,
    NzListModule,
    NzIconModule,
    NzInputNumberModule,
    IonicModule,
    ClickOutsideDirective
  ]
})
export class CreateInvestmentContractPage implements OnInit {
  projectId!: string;
  investorId!: string;
  project!: ProjectModel;

  contractForm!: FormGroup;

  vndCurrencyPipe!: VndCurrencyPipe;
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  disbursements: DisbursementCreateModel[] = [];
  disbursementTotalAmount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private modalService: NzModalService,
    private location: Location
  ) {}

  ngOnInit() {
    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      contractIdNumber: ['', [Validators.required]],
      shareQuantity: [0, [Validators.required]],
      percentage: [0, [Validators.required]],
      buyPrice: [0, [Validators.required]]
    });

    this.route.data.subscribe(data => {
      this.project = data['project'];
    });

    this.route.parent?.paramMap.subscribe(value => {
      this.projectId = value.get('id')!;
    })

    this.route.queryParamMap.subscribe(value => {
      if (!value.get('investorId')) {
        this.navigateBack()
      }
      this.investorId = value.get('investorId')!;
      const percentage = parseInt(value.get('equityShare') ?? '0');
      const shareQuantity = Math.round(this.project.totalShares * percentage / 100);
      const buyPrice = parseInt(value.get('buyPrice') ?? '0');
      this.contractForm.patchValue({
        shareQuantity: shareQuantity,
        percentage: percentage,
        buyPrice: buyPrice
      })
    });

    this.vndCurrencyPipe = new VndCurrencyPipe();
  }

  getProjectInfo() {
    this.projectService
      .getProject(this.projectId)
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(result => this.project = result);
  }

  updateShareQuantity() {
    this.contractForm.patchValue({shareQuantity: Math.round(this.project.totalShares * this.contractForm.value.percentage / 100)});
  }

  updateSharePercentage() {
    this.contractForm.patchValue({percentage: (this.contractForm.value.shareQuantity / this.project.totalShares * 100).toFixed(2)});
  }

  openDisbursementModal(disbursement?: DisbursementCreateModel, index?: number) {
    this.getProjectInfo();
    console.log(this.project);

    const isEdit = disbursement !== undefined;

    this.modalService.create({
      nzTitle: isEdit ? 'Sửa lần giải ngân' : 'Thêm lần giải ngân',
      nzContent: CreateDisbursementFormComponent,
      nzData: isEdit ? {...disbursement} : {
        title: '',
        startDate: null,
        endDate: null,
        amount: null,
        condition: ''
      },
      nzCancelText: "Hủy",
      nzOnOk: (componentInstance) => {
        const formValue = componentInstance.disbursementForm.value;

        if (isEdit) {
          // Update total amount
          this.disbursementTotalAmount += formValue.amount - this.disbursements[index!].amount;
          // Create new array with the updated item
          this.disbursements = [
            ...this.disbursements.slice(0, index),
            formValue,
            ...this.disbursements.slice(index! + 1)
          ];
        } else {
          // Update total amount
          this.disbursementTotalAmount += formValue.amount;
          // Create new array with the added item
          this.disbursements = [...this.disbursements, formValue];
        }
      }
    });
  }

  removeDisbursement(index: number): void {
    this.disbursements = [
      ...this.disbursements.slice(0, index),
      ...this.disbursements.slice(index + 1)
    ];
  }

  onSubmit() {
    if (this.contractForm.valid) {
      const contract: InvestmentContractCreateModel = {
        contract: {
          ...this.contractForm.value,
          projectId: this.project.id
        },
        investorInfo: {
          ...this.contractForm.value,
          userId: this.investorId
        },
        disbursements: this.disbursements
      };
      console.log(contract);
      this.router.navigate(['/projects', this.route.parent?.snapshot.paramMap.get('id'), '/project-deal-list']);
    }
  }

  navigateBack() {
    this.location.back();
  }
}
