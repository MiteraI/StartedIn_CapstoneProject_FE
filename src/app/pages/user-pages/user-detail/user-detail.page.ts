import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FullProfile } from 'src/app/shared/models/user/full-profile.model';
import { AccountService } from 'src/app/core/auth/account.service';
import { MatIconModule } from '@angular/material/icon';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { InitialsOnlyPipe } from 'src/app/shared/pipes/initials-only.pipe';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.page.html',
  styleUrls: ['./user-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, MatIconModule, NzAvatarModule, InitialsOnlyPipe]
})
export class UserDetailPage implements OnInit, OnDestroy {
  user!: FullProfile;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data['user'];

    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe(account => {
      if (account && account.id === this.user.id) {
        this.router.navigate(['/profile']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
