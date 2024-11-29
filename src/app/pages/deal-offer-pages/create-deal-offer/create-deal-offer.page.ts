import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ActivatedRoute } from '@angular/router';
import { DealOfferService } from 'src/app/services/deal-offer.service';
import { DealOfferCreateModel } from 'src/app/shared/models/deal-offer/deal-offer-create.model';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { ProjectOveriewModel } from 'src/app/shared/models/project/project-overview.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-create-deal-offer',
  templateUrl: './create-deal-offer.page.html',
  styleUrls: ['./create-deal-offer.page.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    CommonModule
  ]
})
export class CreateDealOfferPage implements OnInit {
  dealOfferForm!: FormGroup;
  projectInfo!: ProjectOveriewModel;

  percentFormatter = (value: number) => `${value}%`;
  percentParser = (value: string) => value.replace('%', '');
  vndCurrencyPipe!: VndCurrencyPipe;
  vndFormatter = (value: number) => this.vndCurrencyPipe.transform(value);
  vndParser = (value: string) => value.replace(/\D/g,''); // remove all non-digits

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dealOfferService: DealOfferService,
    private notification: NzNotificationService
  ) {}

  ngOnInit() {
    this.vndCurrencyPipe = new VndCurrencyPipe();
    this.dealOfferForm = this.fb.group({
      amount: [10000000, [Validators.required, Validators.min(1000)]],
      equityShareOffer: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      termCondition: ['', [Validators.required]]
    });

    this.route.data.subscribe(data => {
      this.projectInfo = data['projectOverview'];
    });
  }

  onSubmit(): void {
    if (this.dealOfferForm.valid) {
      const dealOffer: DealOfferCreateModel = {
        ...this.dealOfferForm.value,
        projectId: this.route.snapshot.paramMap.get('projectId')!
      };
      this.dealOfferService
        .postDealOffer(dealOffer)
        .pipe(
          catchError(error => {
            this.notification.error("Lỗi", "Tạo thỏa thuận thất bại!", { nzDuration: 2000 });
            return throwError(() => new Error(error.error));
          })
        )
        .subscribe(result => {
          this.router.navigate(['deals']);
        });
    }
  }
}
