import { CommonModule } from '@angular/common'
import { Component, Input, OnDestroy, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router'
import { filter, Subject, takeUntil } from 'rxjs'
import { AccountService } from 'src/app/core/auth/account.service'
import { Authority } from 'src/app/shared/constants/authority.constants'

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterModule, MatIconModule, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit, OnDestroy {
  @Input({ required: true }) isDesktopView: boolean = false
  @Input({ required: true }) inProjectDetails: boolean = false

  projectId = ''
  private destroy$ = new Subject<void>()
  isInvestor = false
  constructor(private activatedRoute: ActivatedRoute, private router: Router, private accountService: AccountService) {}

  ngOnInit() {
    this.accountService.account$.pipe(takeUntil(this.destroy$)).subscribe((account) => {
      this.isInvestor = account?.authorities.includes(Authority.INVESTOR) ?? false
    })
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const parentRoute = this.activatedRoute.snapshot.firstChild
        if (parentRoute && parentRoute.params) {
          this.projectId = parentRoute.params['id']
        }
      })
  }

  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
