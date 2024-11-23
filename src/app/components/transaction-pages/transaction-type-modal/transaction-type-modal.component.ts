import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-transaction-type-modal',
  templateUrl: './transaction-type-modal.component.html',
  styleUrls: ['./transaction-type-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule]
})
export class TransactionTypeModalComponent {
  constructor(
    private modal: NzModalRef,
    private router: Router,
    @Inject(NZ_MODAL_DATA) private projectId: string,
  ) {}

  onSelect(type: 'buy-assets' | 'create-transaction') {
    this.router.navigate(['/projects', this.projectId, type]);
    this.modal.close();
  }
}
