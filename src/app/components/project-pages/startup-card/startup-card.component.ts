import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { NzAvatarModule } from 'ng-zorro-antd/avatar'
import { NzProgressModule } from 'ng-zorro-antd/progress'
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe'
import { StartupModel } from 'src/app/shared/models/project/startup.model'
import { InvestmentCallStatus } from 'src/app/shared/enums/investment-call-status.enum'
import { differenceInDays } from 'date-fns'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-startup-card',
  templateUrl: './startup-card.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NzAvatarModule,
    NzProgressModule,
    InitialsOnlyPipe,
    MatIconModule
  ]
})
export class StartupCardComponent {
  @Input() project!: StartupModel
  investmentCallStatus = InvestmentCallStatus

  get progressPercentage(): number {
    if (!this.project.investmentCall) return 0;
    return (this.project.investmentCall.amountRaised / this.project.investmentCall.targetCall) * 100;
  }

  get daysLeft(): number {
    if (!this.project.investmentCall?.endDate) return 0;
    return differenceInDays(new Date(this.project.investmentCall.endDate), new Date()) + 1;
  }

  get remainingSharesPercentage(): string {
    if (!this.project.investmentCall) return '0%';
    return this.project.investmentCall.remainAvailableEquityShare + '%';
  }
}
