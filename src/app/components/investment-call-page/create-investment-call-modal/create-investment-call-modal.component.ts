import { Component, OnInit, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal'
import { AntdNotificationService } from 'src/app/core/util/antd-notification.service'
import { InvestmentCallCreateModel } from 'src/app/shared/models/investment-call/investment-call-create.model'
import { InvestmentCallService } from 'src/app/services/investment-call.service'
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { DatePipe, PercentPipe } from '@angular/common'
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzFormModule } from 'ng-zorro-antd/form'
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe'

@Component({
  selector: 'app-create-investment-call-modal',
  templateUrl: './create-investment-call-modal.component.html',
  styleUrls: ['./create-investment-call-modal.component.scss'],
  standalone: true,
  imports: [NzFormModule, NzInputModule, NzDatePickerModule, ReactiveFormsModule, NzButtonModule, NzSelectModule, NzIconModule, NzInputNumberModule, PercentPipe],
  providers: [DatePipe, PercentPipe],
})
export class CreateInvestmentCallModalComponent {
  readonly nzModalData: any = inject(NZ_MODAL_DATA)

  investmentCallForm: FormGroup
  remainingEquityShare: number = 0
  constructor(
    private fb: FormBuilder,
    private antdNoti: AntdNotificationService,
    private nzModalRef: NzModalRef,
    private investmentCallService: InvestmentCallService,
    private datePipe: DatePipe
  ) {
    this.investmentCallForm = this.fb.group({
      valuePerPercentage: [1000000, [Validators.required]],
      targetCall: [1000000, [Validators.required]],
      equityShareCall: [1, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
    })

    this.setupFormListeners()
    this.remainingEquityShare = this.nzModalData.currentProject.remainingPercentOfShares
    console.log(this.remainingEquityShare)
  }

  vndCurrencyPipe: VndCurrencyPipe = new VndCurrencyPipe()
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value)
  vndParser = (value: string) => value.replace(/\D/g, '') // remove all non-digits

  formatterPercent = (value: number): string => `${value} %`
  parserPercent = (value: string): string => value.replace(' %', '')
  disabledStartDate = (current: Date): boolean => {
    const endDate = this.investmentCallForm.get('endDate')?.value
    return current < new Date(new Date().setHours(0, 0, 0, 0)) || (endDate && current > new Date(endDate)) // Disable dates before today and after the selected end date
  }

  disabledEndDate = (current: Date): boolean => {
    const startDate = this.investmentCallForm.get('startDate')?.value
    return current < (startDate ?? new Date()) // Disable dates before the selected start date
  }

  onSubmit() {
    if (this.investmentCallForm.valid) {
      const investmentCallData: InvestmentCallCreateModel = this.investmentCallForm.value
      console.log(investmentCallData)

      let startDate = this.investmentCallForm.value.startDate
      if (startDate) {
        startDate = this.datePipe.transform(startDate, 'yyyy-MM-dd')
      }

      let endDate = this.investmentCallForm.value.endDate
      if (endDate) {
        endDate = this.datePipe.transform(endDate, 'yyyy-MM-dd')
      }

      investmentCallData.startDate = startDate
      investmentCallData.endDate = endDate

      this.investmentCallService.createInvestmentCall(this.nzModalData.projectId, investmentCallData).subscribe({
        next: () => {
          this.antdNoti.openSuccessNotification('Tạo Cuộc Gọi Đầu Tư Thành Công', '')
          this.investmentCallService.refreshInvestmentCall$.next(true)
          this.nzModalRef.close()
        },
        error: (error) => {
          this.antdNoti.openErrorNotification('Lỗi', error.message)
        },
      })
    }
  }

  setupFormListeners() {
    // Combine changes from valuePerPercentage and equityShareCall
    this.investmentCallForm.get('valuePerPercentage')?.valueChanges.subscribe(() => {
      this.updateTargetCall()
    })

    this.investmentCallForm.get('equityShareCall')?.valueChanges.subscribe(() => {
      this.updateTargetCall()
    })
  }

  updateTargetCall() {
    const valuePerPercentage = this.investmentCallForm.get('valuePerPercentage')?.value || 0
    const equityShareCall = this.investmentCallForm.get('equityShareCall')?.value || 0
    const targetCall = valuePerPercentage * equityShareCall

    // Update the targetCall field
    this.investmentCallForm.get('targetCall')?.setValue(targetCall, { emitEvent: false })
  }
}
