import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionModel } from 'src/app/shared/models/transaction/transaction.model';
import { TransactionType, TransactionTypeLabels } from 'src/app/shared/enums/transaction-type.enum';
import { MatIconModule } from '@angular/material/icon';
import { VndCurrencyPipe } from 'src/app/shared/pipes/vnd-currency.pipe';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { ViewTitleBarComponent } from 'src/app/layouts/view-title-bar/view-title-bar.component';

@Component({
  selector: 'app-transaction-details',
  templateUrl: './transaction-details.page.html',
  styleUrls: ['./transaction-details.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    VndCurrencyPipe,
    InitialsOnlyPipe,
    NzAvatarModule,
    ViewTitleBarComponent
  ]
})
export class TransactionDetailsPage implements OnInit {
  transaction!: TransactionModel;
  transactionTypes = TransactionType;
  typeLabels = TransactionTypeLabels;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.transaction = this.route.snapshot.data['transaction'];
    console.log(this.transaction);
  }

  downloadFile(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  navigateToUser(userId?: string) {
    if (userId) {
      this.router.navigate(['/users', userId]);
    }
  }
}
