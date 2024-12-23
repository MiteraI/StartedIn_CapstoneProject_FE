import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { LeaderTransferHistoryModel } from 'src/app/shared/models/leader-transfer/leader-transfer-history.model';
import { LeaderTransferService } from 'src/app/services/leader-transfer.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-leader-transfer-detail',
  templateUrl: './leader-transfer-detail.page.html',
  styleUrls: ['./leader-transfer-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    NzAvatarModule,
    InitialsOnlyPipe,
    RouterModule
  ]
})
export class LeaderTransferDetailPage implements OnInit {
  projectId!: string;
  transfer!: LeaderTransferHistoryModel;

  constructor(
    private route: ActivatedRoute,
    private leaderTransferService: LeaderTransferService
  ) {}

  ngOnInit() {
    this.transfer = this.route.snapshot.data['transfer'];
    this.route.parent?.paramMap.subscribe(params => {
      if (!params.get('id')) return;
      this.projectId = params.get('id')!;
    });
  }

  formatDate(dateStr: string): string {
    return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
  }

  downloadAttachment(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
