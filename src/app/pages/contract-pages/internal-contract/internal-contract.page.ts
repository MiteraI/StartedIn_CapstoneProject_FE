import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ProjectModel } from 'src/app/shared/models/project/project.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ContractService } from 'src/app/services/contract.service';
import { catchError, Observable, throwError } from 'rxjs';
import { ContractStatus } from 'src/app/shared/enums/contract-status.enum';
import { ShareEquityCreateUpdateModel } from 'src/app/shared/models/share-equity/share-equity-create-update.model';
import { InternalContractCreateUpdateModel } from 'src/app/shared/models/contract/internal-contract-create-update.model';
import { InternalContractDetailModel } from 'src/app/shared/models/contract/internal-contract-detail.model';
import { TeamMemberModel } from 'src/app/shared/models/user/team-member.model';
import { ProjectService } from 'src/app/services/project.service';
import { TeamRole } from 'src/app/shared/enums/team-role.enum';
import { AccountService } from 'src/app/core/auth/account.service';
import { MobileTitleBarComponent } from 'src/app/layouts/mobile-title-bar/mobile-title-bar.component';

@Component({
  selector: 'app-internal-contract',
  templateUrl: './internal-contract.page.html',
  styleUrls: ['./internal-contract.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzListModule,
    NzIconModule,
    NzSelectModule,
    NzInputNumberModule,
    IonicModule,
    MobileTitleBarComponent
  ]
})
export class InternalContractPage implements OnInit {
  isReadOnly = false;

  project!: ProjectModel;
  contract: InternalContractDetailModel | null = null;
  contractId: string | null = null;
  memberList: TeamMemberModel[] = [];
  selectedMemberId: string | null = null;

  contractForm!: FormGroup;
  percentFormatter = (value: number) => `${value}%`;
  percentParser = (value: string) => value.replace('%', '');

  shareTotal: number = 0;

  private currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private fb: FormBuilder,
    private contractService: ContractService,
    private projectService: ProjectService,
    private notification: NzNotificationService,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.accountService.account$.subscribe(account => {
      if (account) {
        this.currentUserId = account.id;
      }
    });

    this.contractForm = this.fb.group({
      contractName: ['', [Validators.required]],
      contractPolicy: [''],
      contractIdNumber: ['', [Validators.required]],
      shares: this.fb.array([])
    });

    this.route.data.subscribe(data => {
      this.project = data['project'];
      this.projectService
        .getMembers(this.project.id)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Lấy danh sách thành viên thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(response => this.memberList = response.filter(m => m.roleInTeam !== TeamRole.INVESTOR));

      this.contract = data['contract'];
      if (!!this.contract) {
        // import data
        this.isReadOnly = !(this.contract.contractStatus === ContractStatus.DRAFT);

        if (this.isReadOnly) {
          this.contractForm.disable();
        }
        this.contractId = this.contract.id;
        this.contractForm.patchValue({
          contractName: this.contract.contractName,
          contractPolicy: this.contract.contractPolicy,
          contractIdNumber: this.contract.contractIdNumber,
        })
        this.contract.shareEquities.forEach(share => this.addShare(share));
      } else {
        this.addShare({
          userId: this.currentUserId!,
          shareQuantity: 0,
          percentage: 0,
          buyPrice: 0
        })
      }
    });
  }

  get sharesFormArray() {
    return this.contractForm.get('shares') as FormArray;
  }

  addShare(share?: ShareEquityCreateUpdateModel) {
    const shareForm = this.fb.group({
      userId: [share?.userId || '', Validators.required],
      shareQuantity: [share?.shareQuantity || 0, [Validators.required, Validators.min(0)]],
      percentage: [share?.percentage || 0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.sharesFormArray.push(shareForm);
    this.updateTotalShares();
  }

  removeShare(index: number) {
    if (this.sharesFormArray.length <= 1) {
      return;
    }
    this.sharesFormArray.removeAt(index);
    this.updateTotalShares();
  }

  private updateTotalShares() {
    this.shareTotal = this.sharesFormArray.controls.reduce(
      (total, control) => total + (control.get('percentage')?.value || 0),
      0
    );
  }

  updateShareQuantity(index: number) {
    this.sharesFormArray.at(index).patchValue({
      shareQuantity: Math.round(this.project.totalShares * this.sharesFormArray.at(index).value.percentage / 100)
    });
  }

  updateSharePercentage(index: number) {
    this.sharesFormArray.at(index).patchValue({
      percentage: (this.sharesFormArray.at(index).value.shareQuantity / this.project.totalShares * 100).toFixed(2)
    });
  }

  save() {
    this.createOrUpdateContract().subscribe(response => this.contractId = response.id);
  }

  saveAndSend() {
    if (!this.contractForm.valid) {
      return;
    }
    this.createOrUpdateContract()
      .subscribe(response => {
        this.contractId = response.id;
        this.contractService
          .sendContract(this.contractId!, this.project.id)
          .pipe(
            catchError(error => {
              this.notification.error("Lỗi", "Gửi thỏa thuận thất bại!", { nzDuration: 2000 });
              return throwError(() => new Error(error.error));
            })
          )
          .subscribe(response => this.router.navigate(['projects', this.project.id, 'contracts']))
      })
  }

  createOrUpdateContract(): Observable<any> {
    var o: Observable<any>;
    if (!this.contractId) {
      // Create contract
      o = this.contractService
          .createInternalContract(this.project.id, this.contractModel)
    } else {
      // Update contract
      o = this.contractService
        .updateInternalContract(this.contractId, this.project.id, this.contractModel)
    }
    return o.pipe(
      catchError(error => {
        this.notification.error("Lỗi", "Lưu dữ liệu thỏa thuận thất bại!", { nzDuration: 2000 });
        return throwError(() => new Error(error.error));
      })
    );
  }

  get contractModel(): InternalContractCreateUpdateModel {
    return {
      contract: {
        contractName: this.contractForm.value.contractName || 'Hợp đồng chưa có tên',
        contractPolicy: this.contractForm.value.contractPolicy || '',
        contractIdNumber: this.contractForm.value.contractIdNumber || ''
      },
      shareEquitiesOfMembers: this.sharesFormArray.value
    };
  }

  showPreview() {
    alert('not implemented');
  }

  download() {
    this.contractService
      .downloadContract(this.contractId!, this.project.id)
      .pipe(
        catchError(error => {
          this.notification.error("Lỗi", "Tải hợp đồng thất bại!", { nzDuration: 2000 });
          return throwError(() => new Error(error.error));
        })
      )
      .subscribe(response => {
        window.open(response.downLoadUrl, '_blank');
      });
  }

  navigateBack() {
    this.location.back();
  }
}
