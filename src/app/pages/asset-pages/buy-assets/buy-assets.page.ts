import { Component, OnDestroy, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzNotificationService } from 'ng-zorro-antd/notification'
import { TransactionService } from 'src/app/services/transaction.service'
import { TransactionCreateModel } from 'src/app/shared/models/transaction/transaction-create.model'
import { TransactionType } from 'src/app/shared/enums/transaction-type.enum'
import { Account } from 'src/app/core/auth/account.model'
import { AccountService } from 'src/app/core/auth/account.service'
import { TeamRole } from 'src/app/shared/enums/team-role.enum'
import { ActivatedRoute, Router } from '@angular/router'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'
import { TitleBarComponent } from 'src/app/layouts/title-bar/title-bar.component'
import { RoleInTeamService } from 'src/app/core/auth/role-in-team.service'
import { catchError, throwError, finalize, takeUntil, Subject } from 'rxjs'

@Component({
  selector: 'app-buy-assets',
  templateUrl: './buy-assets.page.html',
  styleUrls: ['./buy-assets.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzDatePickerModule,
    NzButtonModule,
    TitleBarComponent,
    VndCurrencyPipe,
  ],
})
export class BuyAssetsPage implements OnInit, OnDestroy {
  assetForm!: FormGroup
  account?: Account | null
  projectId!: string
  customContent = false
  vndCurrencyPipe = new VndCurrencyPipe()
  selectedFile: File | null = null
  isSubmitting = false
  private destroy$ = new Subject<void>()

  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value)
  vndParser = (value: string) => value.replace(/\D/g, '')

  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private notification: NzNotificationService,
    private roleService: RoleInTeamService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.roleService.role$.subscribe((role) => {
      if (!role || role.roleInTeam !== TeamRole.LEADER) {
        this.router.navigate(['../'], { relativeTo: this.route })
        return
      }
    })

    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.account = account
    })

    this.route.parent?.paramMap.subscribe((params) => {
      if (!params.get('id')) return
      this.projectId = params.get('id')!
    })

    this.assetForm = this.fb.group({
      toName: ['', Validators.required],
      content: [''],
      assets: this.fb.array([this.createAssetFormGroup()]),
    })
  }

  createAssetFormGroup(): FormGroup {
    return this.fb.group({
      assetName: ['', Validators.required],
      price: [1000000, [Validators.required, Validators.min(1000)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      serialNumber: [''],
    })
  }

  get assets(): FormArray {
    return this.assetForm.get('assets') as FormArray
  }

  addAsset() {
    this.assets.push(this.createAssetFormGroup())
  }

  removeAsset(index: number) {
    if (this.assets.length > 1) {
      this.assets.removeAt(index)
    }
  }

  getTotalAmount(): number {
    return this.assets.controls.reduce((total, control) => {
      return total + (control.get('price')?.value || 0) * (control.get('quantity')?.value || 0)
    }, 0)
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file
    }
  }

  submit() {
    if (!this.assetForm.valid || !this.selectedFile) {
      Object.values(this.assetForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsTouched()
        }
      })
      if (!this.selectedFile) {
        this.notification.error('Lỗi', 'Vui lòng chọn chứng từ')
      }
      return
    }

    this.isSubmitting = true

    const transaction: TransactionCreateModel = {
      amount: this.getTotalAmount(),
      fromId: this.account?.id,
      toName: this.assetForm.value.toName,
      type: TransactionType.ASSET_EXPENSE,
      isInFlow: false,
      content: this.customContent ? this.assetForm.value.content : this.generateContent(),
      assets: this.assets.value,
    }

    this.transactionService
      .createTransaction(this.projectId, transaction)
      .pipe(
        catchError((error) => {
          this.notification.error('Lỗi', 'Thêm tài sản thất bại')
          return throwError(() => new Error(error.error))
        })
      )
      .subscribe((response) => {
        this.transactionService
          .uploadEvidence(response.id, this.projectId, this.selectedFile!)
          .pipe(
            finalize(() => (this.isSubmitting = false)),
            catchError((error) => {
              this.notification.error('Lỗi', 'Tải lên chứng từ thất bại')
              return throwError(() => new Error(error.error))
            })
          )
          .subscribe(() => {
            this.notification.success('Thành công', 'Thêm tài sản thành công')
            this.router.navigate(['../assets'], { relativeTo: this.route })
          })
      })
  }

  private generateContent(): string {
    const assetNames = this.assets.value.map((asset: any) => asset.assetName).join(', ')
    return `Mua tài sản: ${assetNames}`
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
